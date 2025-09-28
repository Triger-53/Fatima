import { supabase } from "../supabase"

// Enhanced slot management utilities
export class SlotManager {
	constructor() {
		this.bookingRange = 30 // Default 30 days
		this.cache = new Map()
		this.cacheTimeout = 5 * 60 * 1000 // 5 minutes cache
		this.locations = []
		this.schedules = new Map()
		this.isInitialized = false
		this.initialize()
	}

	async initialize() {
		try {
			const { data: locations, error: locationsError } = await supabase
				.from("locations")
				.select("*")
			if (locationsError) throw locationsError
			this.locations = locations

			const { data: schedules, error: schedulesError } = await supabase
				.from("availability_schedules")
				.select("*")
			if (schedulesError) throw schedulesError

			this.schedules.clear()
			schedules.forEach((schedule) => {
				if (!this.schedules.has(schedule.location_id)) {
					this.schedules.set(schedule.location_id, {})
				}
				this.schedules.get(schedule.location_id)[schedule.day_of_week] =
					schedule
			})

			this.isInitialized = true
			console.log("SlotManager initialized with data from Supabase.")
		} catch (error) {
			console.error("Failed to initialize SlotManager:", error)
			this.isInitialized = false
		}
	}

	async ensureInitialized() {
		if (!this.isInitialized) {
			await this.initialize()
		}
	}

	// Get day of week from date string
	getDayOfWeek(dateString) {
		const date = new Date(dateString);
		const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
		return days[date.getDay()];
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
	async getAvailableSlots(
		dateString,
		consultationMethod,
		locationId = null
	) {
		await this.ensureInitialized()
		const dayOfWeek = this.getDayOfWeek(dateString)

		let targetLocation
		if (consultationMethod === "online") {
			targetLocation = this.locations.find((loc) => loc.type === "online")
		} else {
			targetLocation = this.locations.find((loc) => loc.id === locationId)
		}

		if (!targetLocation) return []

		const locationSchedules = this.schedules.get(targetLocation.id)
		const daySchedule = locationSchedules ? locationSchedules[dayOfWeek] : null

		if (daySchedule && daySchedule.is_active) {
			return daySchedule.slots || []
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
		await this.ensureInitialized()
		const dates = this.getAvailableDates(bookingRange)
		const summary = {
			totalSlots: 0,
			bookedSlots: 0,
			availableSlots: 0,
			byDate: {},
			byLocation: {},
		}

		// Fetch all booked appointments and sessions in the range
		const { data: bookedAppointments, error: apptError } = await supabase
			.from("Appointment")
			.select("preferredDate, preferredTime, consultationMethod, medicalCenter")
			.in("preferredDate", dates)
		if (apptError) {
			console.error("Error fetching appointments for summary:", apptError)
			return summary
		}

		const { data: bookedSessions, error: sessionError } = await supabase
			.from("sessions")
			.select("date, time")
			.in("date", dates)
		if (sessionError) {
			console.error("Error fetching sessions for summary:", sessionError)
			return summary
		}

		const bookedSlotsSet = new Set()
		bookedAppointments.forEach((a) => {
			const key = `${a.preferredDate}_${a.preferredTime}_${
				a.consultationMethod
			}_${a.medicalCenter || "online"}`
			bookedSlotsSet.add(key)
		})
		bookedSessions.forEach((s) => {
			this.locations.forEach((loc) => {
				const key = `${s.date}_${s.time}_${loc.type}_${
					loc.type === "offline" ? loc.id : "online"
				}`
				bookedSlotsSet.add(key)
			})
		})

		// Initialize location tracking
		this.locations.forEach((loc) => {
			summary.byLocation[loc.id] = {
				name: loc.name,
				totalSlots: 0,
				bookedSlots: 0,
				availableSlots: 0,
				type: loc.type,
			}
		})

		for (const date of dates) {
			summary.byDate[date] = {
				online: { total: 0, booked: 0, available: 0, locationId: null },
				offline: {},
			}

			for (const loc of this.locations) {
				const locationSchedules = this.schedules.get(loc.id)
				if (!locationSchedules) continue

				const dayOfWeek = this.getDayOfWeek(date)
				const daySchedule = locationSchedules[dayOfWeek]

				if (daySchedule && daySchedule.is_active) {
					const slots = daySchedule.slots || []
					if (loc.type === "online") {
						summary.byDate[date].online.locationId = loc.id
					} else {
						summary.byDate[date].offline[loc.id] = {
							total: 0,
							booked: 0,
							available: 0,
						}
					}

					for (const slot of slots) {
						const key = `${date}_${slot}_${loc.type}_${
							loc.type === "offline" ? loc.id : "online"
						}`
						const isBooked = bookedSlotsSet.has(key)

						summary.totalSlots++
						summary.byLocation[loc.id].totalSlots++

						if (loc.type === "online") {
							summary.byDate[date].online.total++
						} else {
							summary.byDate[date].offline[loc.id].total++
						}

						if (isBooked) {
							summary.bookedSlots++
							summary.byLocation[loc.id].bookedSlots++
							if (loc.type === "online") {
								summary.byDate[date].online.booked++
							} else {
								summary.byDate[date].offline[loc.id].booked++
							}
						} else {
							summary.availableSlots++
							summary.byLocation[loc.id].availableSlots++
							if (loc.type === "online") {
								summary.byDate[date].online.available++
							} else {
								summary.byDate[date].offline[loc.id].available++
							}
						}
					}
				}
			}
		}

		return summary
	}

	// Clear cache
	clearCache() {
		this.cache.clear();
	}

	// Set booking range
	setBookingRange(days) {
		this.bookingRange = days;
		this.clearCache(); // Clear cache when range changes
	}
}

// Create singleton instance
export const slotManager = new SlotManager()
// Legacy functions for backward compatibility
export const getDayOfWeek = (dateString) => {
	return slotManager.getDayOfWeek(dateString)
}

export const getAvailableSlots = (
	dateString,
	appointmentType,
	medicalCenter = null
) => {
	return slotManager.getAvailableSlots(
		dateString,
		appointmentType,
		medicalCenter
	)
}

export const isSlotAvailable = async (
	dateString,
	timeSlot,
	appointmentType,
	medicalCenter = null
) => {
	return slotManager.isSlotAvailable(
		dateString,
		timeSlot,
		appointmentType,
		medicalCenter
	)
}

export const getAvailableDates = (bookingRange = 30) => {
	return slotManager.getAvailableDates(bookingRange)
}
