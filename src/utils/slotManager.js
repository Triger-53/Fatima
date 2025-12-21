import { supabase } from "../supabase"

// Enhanced slot management utilities
export class SlotManager {
	constructor() {
		this.bookingRange = 30 // Default fallback
		this.onlineSlots = {}
		this.sessionQuota = {}
		this.medicalCenters = []
		this.cache = new Map()
		this.cacheTimeout = 5 * 60 * 1000 // 5 minutes cache
		this.initialized = this.initialize()
	}

	async initialize() {
		try {
			// Fetch settings
			const { data: settingsData, error: settingsError } = await supabase
				.from("settings")
				.select("id, booking_range, online_slots, session_quota")
				.limit(1)
				.single()

			if (settingsError) {
				console.error("Error fetching settings:", settingsError)
			} else if (settingsData) {
				this.settingsId = settingsData.id
				this.bookingRange = settingsData.booking_range
				this.onlineSlots = settingsData.online_slots
				this.sessionQuota = settingsData.session_quota
			}

			// Fetch hospitals
			const { data: hospitals, error: hospitalsError } = await supabase
				.from("hospitals")
				.select("*")

			if (hospitalsError) {
				console.error("Error fetching hospitals:", hospitalsError)
			} else if (hospitals) {
				this.medicalCenters = hospitals
			}
		} catch (error) {
			console.error("Failed to initialize SlotManager:", error)
		}
	}

	// Get day of week from date string
	getDayOfWeek(dateString) {
		const date = new Date(dateString)
		const days = [
			"sunday",
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
			"saturday",
		]
		return days[date.getDay()]
	}

	// Get available dates within booking range
	getAvailableDates(bookingRange = this.bookingRange) {
		const dates = [];
		const today = new Date();
		const maxDate = new Date(today);
		maxDate.setDate(today.getDate() + bookingRange);

		for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
			dates.push(d.toISOString().split('T')[0]);
		}
		return dates;
	}

	// Get available slots for a specific date and consultation method
	getAvailableSlots(dateString, consultationMethod, medicalCenter = null) {
		const dayOfWeek = this.getDayOfWeek(dateString)

		if (consultationMethod === "online") {
			return this.onlineSlots[dayOfWeek] && this.onlineSlots[dayOfWeek].slots
				? this.onlineSlots[dayOfWeek].slots
				: []
		} else if (consultationMethod === "offline" && medicalCenter) {
			const center = this.medicalCenters.find(
				(c) => String(c.id) === String(medicalCenter)
			)
			return center &&
				center.doctorSchedule[dayOfWeek] &&
				center.doctorSchedule[dayOfWeek].slots
				? center.doctorSchedule[dayOfWeek].slots
				: []
		}

		return []
	}

	// Check if a slot is available (with database check)
	async isSlotAvailable(dateString, timeSlot, consultationMethod, medicalCenter = null, bypassCache = false) {
		const cacheKey = `slot_${dateString}_${timeSlot}_${consultationMethod}_${medicalCenter || 'online'}`;

		// Check cache first
		if (!bypassCache && this.cache.has(cacheKey)) {
			const cached = this.cache.get(cacheKey);
			if (Date.now() - cached.timestamp < this.cacheTimeout) {
				return cached.available;
			}
		}

		try {
			// Check for sessions first, as they block all types for that time
			const { count: sessionCount, error: sessionError } = await supabase
				.from('sessions')
				.select('id', { count: 'exact', head: true })
				.eq('date', dateString)
				.eq('time', timeSlot);

			if (sessionError) {
				console.error('Error checking for sessions:', sessionError);
				return false; // Fail safe
			}

			if (sessionCount > 0) {
				this.cache.set(cacheKey, { available: false, timestamp: Date.now() });
				return false; // Slot is booked by a session
			}

			// Check for appointments of the specific type
			let query = supabase
				.from('Appointment')
				.select('id', { count: 'exact', head: true })
				.eq('preferredDate', dateString)
				.eq('preferredTime', timeSlot)
				.eq('consultationMethod', consultationMethod);

			if (consultationMethod === 'offline') {
				query = query.eq('medicalCenter', medicalCenter);
			} else {
				query = query.is('medicalCenter', null);
			}

			const { error, count } = await query;

			if (error) {
				console.error('Error checking slot availability:', error);
				return false; // Fail safe
			}

			const isAvailable = count === 0;

			// Cache the result
			this.cache.set(cacheKey, {
				available: isAvailable,
				timestamp: Date.now()
			});

			return isAvailable;
		} catch (error) {
			console.error('Error checking slot availability:', error);
			return false;
		}
	}

	async isTimeSlotCompletelyFree(dateString, timeSlot) {
		try {
			// Check for sessions
			const { count: sessionCount, error: sessionError } = await supabase
				.from('sessions')
				.select('id', { count: 'exact', head: true })
				.eq('date', dateString)
				.eq('time', timeSlot);

			if (sessionError) {
				console.error('Error checking for sessions:', sessionError);
				return false; // Fail safe
			}
			if (sessionCount > 0) {
				return false; // Booked by a session
			}

			// Check for appointments
			const { count: appointmentCount, error: appointmentError } = await supabase
				.from('Appointment')
				.select('id', { count: 'exact', head: true })
				.eq('preferredDate', dateString)
				.eq('preferredTime', timeSlot);

			if (appointmentError) {
				console.error('Error checking for appointments:', appointmentError);
				return false; // Fail safe
			}

			return appointmentCount === 0; // Free if no appointments found

		} catch (error) {
			console.error('Error checking if time slot is free:', error);
			return false;
		}
	}

	// Get all available slots for a date by fetching booked slots and filtering
	async getAvailableSlotsForDate(dateString, consultationMethod, medicalCenter = null) {
		const allPossibleSlots = this.getAvailableSlots(dateString, consultationMethod, medicalCenter);
		if (!allPossibleSlots.length) {
			return [];
		}

		try {
			let query = supabase
				.from('Appointment')
				.select('preferredTime')
				.eq('preferredDate', dateString)
				.eq('consultationMethod', consultationMethod);

			if (consultationMethod === 'offline') {
				query = query.eq('medicalCenter', medicalCenter);
			} else {
				query = query.is('medicalCenter', null);
			}

			const { data: bookedAppointments, error } = await query;

			if (error) {
				console.error('Error fetching booked slots:', error);
				return []; // Fail safe, return no slots
			}

			const { data: bookedSessions, error: sessionError } = await supabase
				.from('sessions')
				.select('time')
				.eq('date', dateString);

			if (sessionError) {
				console.error('Error fetching booked sessions:', sessionError);
				return []; // Fail safe
			}

			const bookedSlots = new Set([
				...bookedAppointments.map(a => a.preferredTime),
				...bookedSessions.map(s => s.time)
			]);
			const availableSlots = allPossibleSlots.filter(slot => !bookedSlots.has(slot));

			return availableSlots;
		} catch (error) {
			console.error('Error calculating available slots:', error);
			return [];
		}
	}

	// Get slot availability summary for admin dashboard
	async getSlotAvailabilitySummary(bookingRange = this.bookingRange) {
		const dates = this.getAvailableDates(bookingRange);
		const summary = {
			totalSlots: 0,
			bookedSlots: 0,
			availableSlots: 0,
			byDate: {},
			byCenter: {}
		};

		// Fetch all booked appointments and sessions in the range to optimize queries
		const { data: bookedAppointments, error: apptError } = await supabase
			.from('Appointment')
			.select('preferredDate, preferredTime, consultationMethod, medicalCenter')
			.in('preferredDate', dates);

		if (apptError) {
			console.error("Error fetching appointments for summary:", apptError);
			return summary;
		}

		const { data: bookedSessions, error: sessionError } = await supabase
			.from('sessions')
			.select('date, time')
			.in('date', dates);

		if (sessionError) {
			console.error("Error fetching sessions for summary:", sessionError);
			return summary;
		}

		const bookedSlotsSet = new Set();
		bookedAppointments.forEach(a => {
			const key = `${a.preferredDate}_${a.preferredTime}_${a.consultationMethod}_${a.medicalCenter || 'online'}`;
			bookedSlotsSet.add(key);
		});
		bookedSessions.forEach(s => {
			// Sessions block all types of slots at that time, so we need to account for this
			const onlineKey = `${s.date}_${s.time}_online_online`;
			bookedSlotsSet.add(onlineKey);
			this.medicalCenters.forEach(center => {
				const offlineKey = `${s.date}_${s.time}_offline_${center.id}`;
				bookedSlotsSet.add(offlineKey);
			});
		});

		// Initialize center tracking
		this.medicalCenters.forEach(center => {
			summary.byCenter[center.id] = {
				name: center.name,
				totalSlots: 0,
				bookedSlots: 0,
				availableSlots: 0
			};
		});

		// Add online center
		summary.byCenter['online'] = {
			name: 'Online Consultation',
			totalSlots: 0,
			bookedSlots: 0,
			availableSlots: 0
		};

		for (const date of dates) {
			summary.byDate[date] = {
				online: { total: 0, booked: 0, available: 0 },
				offline: {}
			};

			// Process online slots
			const onlineSlots = this.getAvailableSlots(date, 'online');
			for (const slot of onlineSlots) {
				const key = `${date}_${slot}_online_online`;
				const isAvailable = !bookedSlotsSet.has(key);

				summary.totalSlots++;
				summary.byCenter['online'].totalSlots++;
				summary.byDate[date].online.total++;

				if (isAvailable) {
					summary.availableSlots++;
					summary.byCenter['online'].availableSlots++;
					summary.byDate[date].online.available++;
				} else {
					summary.bookedSlots++;
					summary.byCenter['online'].bookedSlots++;
					summary.byDate[date].online.booked++;
				}
			}

			// Process offline slots
			for (const center of this.medicalCenters) {
				summary.byDate[date].offline[center.id] = { total: 0, booked: 0, available: 0 };
				const offlineSlots = this.getAvailableSlots(date, 'offline', center.id);

				for (const slot of offlineSlots) {
					const key = `${date}_${slot}_offline_${center.id}`;
					const isAvailable = !bookedSlotsSet.has(key);

					summary.totalSlots++;
					summary.byCenter[center.id].totalSlots++;
					summary.byDate[date].offline[center.id].total++;

					if (isAvailable) {
						summary.availableSlots++;
						summary.byCenter[center.id].availableSlots++;
						summary.byDate[date].offline[center.id].available++;
					} else {
						summary.bookedSlots++;
						summary.byCenter[center.id].bookedSlots++;
						summary.byDate[date].offline[center.id].booked++;
					}
				}
			}
		}

		return summary;
	}

	// Clear cache
	clearCache() {
		this.cache.clear();
	}

	// Set booking range
	async setBookingRange(days) {
		this.bookingRange = days
		this.clearCache() // Clear cache when range changes

		// Persist to database
		const { error } = await supabase
			.from("settings")
			.update({ booking_range: days })
			.eq("id", this.settingsId)
		if (error) {
			console.error("Error updating booking range:", error)
			return { success: false, error: error.message }
		}
		return { success: true }
	}

	// Set online slots
	async setOnlineSlots(newSlots) {
		this.onlineSlots = newSlots
		this.clearCache()

		// Persist to database
		const { error } = await supabase
			.from("settings")
			.update({ online_slots: newSlots })
			.eq("id", this.settingsId)
		if (error) {
			console.error("Error updating online slots:", error)
			return { success: false, error: error.message }
		}
		return { success: true }
	}

	// Set hospital schedule
	async setHospitalSchedule(hospitalId, newSchedule) {
		const centerIndex = this.medicalCenters.findIndex(
			(c) => c.id === hospitalId
		)
		if (centerIndex !== -1) {
			this.medicalCenters[centerIndex].doctorSchedule = newSchedule
		}
		this.clearCache()

		// Persist to database
		const { error } = await supabase
			.from("hospitals")
			.update({ doctorSchedule: newSchedule })
			.eq("id", hospitalId)
		if (error) {
			console.error(
				`Error updating schedule for hospital ${hospitalId}:`,
				error
			)
			return { success: false, error: error.message }
		}
		return { success: true }
	}

	// Set session quota
	async setSessionQuota(newQuota) {
		this.sessionQuota = newQuota
		this.clearCache()

		// Persist to database
		const { error } = await supabase
			.from("settings")
			.update({ session_quota: newQuota })
			.eq("id", this.settingsId)
		if (error) {
			console.error("Error updating session quota:", error)
			return { success: false, error: error.message }
		}
		return { success: true }
	}
}

// Create singleton instance
export const slotManager = new SlotManager()
