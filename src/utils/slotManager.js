import { supabase } from "../supabase"

// Enhanced slot management utilities
export class SlotManager {
	constructor() {
		this.bookingRange = 30 // Default fallback
		this.onlineSlots = {}
		this.sessionSlots = {}
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
				.select("*")
				.limit(1)
				.single()

			if (settingsError) {
				console.error("Error fetching settings:", settingsError)
			} else if (settingsData) {
				this.settingsId = settingsData.id
				this.bookingRange = settingsData.booking_range || 30
				this.onlineSlots = settingsData.online_slots || {}
				this.sessionSlots = settingsData.session_slots || {}
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
	async getAvailableDates(consultationMethod = null, medicalCenter = null, bookingRange = this.bookingRange) {
		const range = parseInt(bookingRange) || this.bookingRange;
		const dates = [];
		const today = new Date();
		const maxDate = new Date(today);
		maxDate.setDate(today.getDate() + range);

		const allDatesInRange = [];
		for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
			allDatesInRange.push(d.toISOString().split('T')[0]);
		}

		// If no consultation method, we can't really check availability per slot,
		// so we just return the basic list (legacy behavior or initial load).
		if (!consultationMethod) {
			return allDatesInRange;
		}

		try {
			const quota = 1;

			const datesForQuery = (allDatesInRange && allDatesInRange.length > 0) ? allDatesInRange : [today.toISOString().split('T')[0]];

			// Bulk fetch appointments for the whole range
			const { data: bookedAppointments, error: apptError } = await supabase
				.from('Appointment')
				.select('preferredDate, preferredTime')
				.in('preferredDate', datesForQuery);

			if (apptError) throw apptError;

			// Bulk fetch sessions for the whole range
			const { data: bookedSessions, error: sessionError } = await supabase
				.from('sessions')
				.select('date, time')
				.in('date', datesForQuery);

			if (sessionError) throw sessionError;

			// Map to count bookings per date and time
			const bookingCounts = {}; // date_time -> count
			bookedAppointments.forEach(a => {
				const key = `${a.preferredDate}_${a.preferredTime}`;
				bookingCounts[key] = (bookingCounts[key] || 0) + 1;
			});
			bookedSessions.forEach(s => {
				const key = `${s.date}_${s.time}`;
				bookingCounts[key] = (bookingCounts[key] || 0) + 1;
			});

			for (const dateString of allDatesInRange) {
				const slots = this.getAvailableSlots(dateString, consultationMethod, medicalCenter);

				if (!slots || slots.length === 0) {
					continue;
				}

				// Check if at least one slot is NOT fully booked
				const hasAvailableSlot = slots.some(time => {
					const count = bookingCounts[`${dateString}_${time}`] || 0;
					return count < quota;
				});

				if (hasAvailableSlot) {
					dates.push(dateString);
				}
			}
		} catch (error) {
			console.error('Error in getAvailableDates availability check:', error);
			// Fallback to basic configured check if DB fails
			for (const dateString of allDatesInRange) {
				const slots = this.getAvailableSlots(dateString, consultationMethod, medicalCenter);
				if (slots && slots.length > 0) dates.push(dateString);
			}
		}

		return dates;
	}

	getAvailableSlots(dateString, consultationMethod, medicalCenter = null) {
		const dayOfWeek = this.getDayOfWeek(dateString)

		if (consultationMethod === "online") {
			return this.onlineSlots[dayOfWeek] && this.onlineSlots[dayOfWeek].slots
				? this.onlineSlots[dayOfWeek].slots
				: []
		} else if (consultationMethod === "session") {
			return this.sessionSlots[dayOfWeek] && this.sessionSlots[dayOfWeek].slots
				? this.sessionSlots[dayOfWeek].slots
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
			const quota = 1;

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

			// Check for appointments
			let apptQuery = supabase
				.from('Appointment')
				.select('id', { count: 'exact', head: true })
				.eq('preferredDate', dateString)
				.eq('preferredTime', timeSlot);

			const { count: appointmentCount, error: appointmentError } = await apptQuery;

			if (appointmentError) {
				console.error('Error checking for appointments:', appointmentError);
				return false; // Fail safe
			}

			const totalBooked = (sessionCount || 0) + (appointmentCount || 0);
			const isAvailable = totalBooked < quota;

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
			const quota = 1;

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

			const totalBooked = (sessionCount || 0) + (appointmentCount || 0);
			return totalBooked < quota;

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
			const quota = 1;

			// Fetch all appointments for this date
			const { data: bookedAppointments, error } = await supabase
				.from('Appointment')
				.select('preferredTime')
				.eq('preferredDate', dateString);

			if (error) {
				console.error('Error fetching booked slots:', error);
				return []; // Fail safe
			}

			// Fetch all sessions for this date
			const { data: bookedSessions, error: sessionError } = await supabase
				.from('sessions')
				.select('time')
				.eq('date', dateString);

			if (sessionError) {
				console.error('Error fetching booked sessions:', sessionError);
				return []; // Fail safe
			}

			// Count occurrences of each slot
			const slotCounts = {};
			bookedAppointments.forEach(a => {
				slotCounts[a.preferredTime] = (slotCounts[a.preferredTime] || 0) + 1;
			});
			bookedSessions.forEach(s => {
				slotCounts[s.time] = (slotCounts[s.time] || 0) + 1;
			});

			// Filter potential slots that haven't reached the quota
			const availableSlots = allPossibleSlots.filter(slot => {
				const count = slotCounts[slot] || 0;
				return count < quota;
			});

			return availableSlots;
		} catch (error) {
			console.error('Error calculating available slots:', error);
			return [];
		}
	}

	// Get slot availability summary for admin dashboard
	async getSlotAvailabilitySummary(bookingRange = this.bookingRange) {
		const summary = {
			totalSlots: 0,
			bookedSlots: 0,
			availableSlots: 0,
			byDate: {},
			byCenter: {}
		};

		const dates = await this.getAvailableDates(null, null, bookingRange);
		if (!dates || !Array.isArray(dates) || dates.length === 0) return summary;

		const quota = 1;

		const datesForQuery = (dates && dates.length > 0) ? dates : [];
		if (datesForQuery.length === 0) return summary;

		// Fetch all booked appointments and sessions in the range to optimize queries
		const { data: bookedAppointments, error: apptError } = await supabase
			.from('Appointment')
			.select('preferredDate, preferredTime')
			.in('preferredDate', datesForQuery);

		if (apptError) {
			console.error("Error fetching appointments for summary:", apptError);
			return summary;
		}

		const { data: bookedSessions, error: sessionError } = await supabase
			.from('sessions')
			.select('date, time')
			.in('date', datesForQuery);

		if (sessionError) {
			console.error("Error fetching sessions for summary:", sessionError);
			return summary;
		}

		// Count bookings per slot
		const slotBookings = {}; // key: date_time
		bookedAppointments.forEach(a => {
			if (!a.preferredDate || !a.preferredTime) return;
			const time = String(a.preferredTime).split(':').slice(0, 2).join(':');
			const key = `${a.preferredDate}_${time}`;
			slotBookings[key] = (slotBookings[key] || 0) + 1;
		});
		bookedSessions.forEach(s => {
			if (!s.date || !s.time) return;
			const time = String(s.time).split(':').slice(0, 2).join(':');
			const key = `${s.date}_${time}`;
			slotBookings[key] = (slotBookings[key] || 0) + 1;
		});

		// Initialize center tracking
		const centers = [
			{ id: 'online', name: 'Online Consultation' },
			{ id: 'session', name: 'Session' },
			...(Array.isArray(this.medicalCenters) ? this.medicalCenters : [])
		];

		centers.forEach(center => {
			summary.byCenter[center.id] = {
				name: center.name,
				totalSlots: 0,
				bookedSlots: 0,
				availableSlots: 0
			};
		});

		for (const date of dates) {
			summary.byDate[date] = {
				online: { total: 0, booked: 0, available: 0 },
				session: { total: 0, booked: 0, available: 0 },
				offline: {}
			};

			// We'll use this to track unique time slots across ALL categories for this date
			const uniqueDateSlots = new Set();

			// 1. Process Online Slots
			const onlineSlots = this.getAvailableSlots(date, 'online') || [];
			for (const slot of onlineSlots) {
				const norm = String(slot).split(':').slice(0, 2).join(':');
				uniqueDateSlots.add(norm);

				const key = `${date}_${norm}`;
				const bookingsCount = slotBookings[key] || 0;
				const remaining = Math.max(0, quota - bookingsCount);

				summary.byCenter['online'].totalSlots += quota;
				summary.byCenter['online'].bookedSlots += bookingsCount;
				summary.byCenter['online'].availableSlots += remaining;

				summary.byDate[date].online.total += quota;
				summary.byDate[date].online.booked += bookingsCount;
				summary.byDate[date].online.available += remaining;
			}

			// 2. Process Session Slots
			const sessionSlots = this.getAvailableSlots(date, 'session') || [];
			for (const slot of sessionSlots) {
				const norm = String(slot).split(':').slice(0, 2).join(':');
				uniqueDateSlots.add(norm);

				const key = `${date}_${norm}`;
				const bookingsCount = slotBookings[key] || 0;
				const remaining = Math.max(0, quota - bookingsCount);

				summary.byCenter['session'].totalSlots += quota;
				summary.byCenter['session'].bookedSlots += bookingsCount;
				summary.byCenter['session'].availableSlots += remaining;

				summary.byDate[date].session.total += quota;
				summary.byDate[date].session.booked += bookingsCount;
				summary.byDate[date].session.available += remaining;
			}

			// 3. Process Offline Slots
			if (Array.isArray(this.medicalCenters)) {
				for (const center of this.medicalCenters) {
					summary.byDate[date].offline[center.id] = { total: 0, booked: 0, available: 0 };
					const offlineSlots = this.getAvailableSlots(date, 'offline', center.id) || [];

					for (const slot of offlineSlots) {
						const norm = String(slot).split(':').slice(0, 2).join(':');
						uniqueDateSlots.add(norm);

						const key = `${date}_${norm}`;
						const bookingsCount = slotBookings[key] || 0;
						const remaining = Math.max(0, quota - bookingsCount);

						summary.byCenter[center.id].totalSlots += quota;
						summary.byCenter[center.id].bookedSlots += bookingsCount;
						summary.byCenter[center.id].availableSlots += remaining;

						summary.byDate[date].offline[center.id].total += quota;
						summary.byDate[date].offline[center.id].booked += bookingsCount;
						summary.byDate[date].offline[center.id].available += remaining;
					}
				}
			}

			// 4. Calculate Global Summary contribution for this date based on UNIQUE slots
			for (const slot of uniqueDateSlots) {
				const key = `${date}_${slot}`;
				const bookingsCount = slotBookings[key] || 0;
				const remaining = Math.max(0, quota - bookingsCount);

				summary.totalSlots += quota;
				summary.bookedSlots += bookingsCount;
				summary.availableSlots += remaining;
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

	// Set session slots
	async setSessionSlots(newSlots) {
		this.sessionSlots = newSlots
		this.clearCache()

		// Persist to database
		const { error } = await supabase
			.from("settings")
			.update({ session_slots: newSlots })
			.eq("id", this.settingsId)
		if (error) {
			console.error("Error updating session slots:", error)
			if (error.code === "42703") {
				return {
					success: false,
					error: "Missing 'session_slots' column in Supabase. Run this SQL in Supabase Editor: ALTER TABLE settings ADD COLUMN session_slots JSONB DEFAULT '{}';"
				}
			}
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

	// Check for overlaps across all consultation methods
	checkScheduleOverlaps() {
		const overlaps = {}; // day -> { time -> [categories] }
		const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

		days.forEach(day => {
			const timeUsage = {}; // time -> [categories]

			// Check Online
			if (this.onlineSlots[day]?.slots) {
				this.onlineSlots[day].slots.forEach(slot => {
					if (!timeUsage[slot]) timeUsage[slot] = [];
					timeUsage[slot].push({ type: 'online', name: 'Online Consultation' });
				});
			}

			// Check Sessions
			if (this.sessionSlots[day]?.slots) {
				this.sessionSlots[day].slots.forEach(slot => {
					if (!timeUsage[slot]) timeUsage[slot] = [];
					timeUsage[slot].push({ type: 'session', name: 'Sessions' });
				});
			}

			// Check Offline Centers
			this.medicalCenters.forEach(center => {
				if (center.doctorSchedule[day]?.slots) {
					center.doctorSchedule[day].slots.forEach(slot => {
						if (!timeUsage[slot]) timeUsage[slot] = [];
						timeUsage[slot].push({ type: 'offline', centerId: center.id, name: center.name });
					});
				}
			});

			// Filter overlaps
			const dayOverlaps = {};
			Object.entries(timeUsage).forEach(([time, categories]) => {
				if (categories.length > 1) {
					dayOverlaps[time] = categories;
				}
			});

			if (Object.keys(dayOverlaps).length > 0) {
				overlaps[day] = dayOverlaps;
			}
		});

		return overlaps;
	}
}

// Create singleton instance
export const slotManager = new SlotManager()
