import { supabase } from '../supabase'
import { MEDICAL_CENTERS, ONLINE_SLOTS } from '../data/appointmentData'

// Enhanced slot management utilities
export class SlotManager {
	constructor() {
		this.bookingRange = 30; // Default 30 days
		this.cache = new Map();
		this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
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
	getAvailableSlots(dateString, consultationMethod, medicalCenter = null) {
		const dayOfWeek = this.getDayOfWeek(dateString);

		if (consultationMethod === 'online') {
			return (ONLINE_SLOTS[dayOfWeek] && ONLINE_SLOTS[dayOfWeek].slots) ? ONLINE_SLOTS[dayOfWeek].slots : [];
		} else if (consultationMethod === 'offline' && medicalCenter) {
			const center = Object.values(MEDICAL_CENTERS).find(c => String(c.id) === String(medicalCenter));
			return (center && center.doctorSchedule[dayOfWeek] && center.doctorSchedule[dayOfWeek].slots)
				? center.doctorSchedule[dayOfWeek].slots
				: [];
		}

		return [];
	}

	// Check if a slot is available (with database check)
	async isSlotAvailable(dateString, timeSlot, consultationMethod, medicalCenter = null) {
		const cacheKey = `slot_${dateString}_${timeSlot}_${consultationMethod}_${medicalCenter || 'online'}`;

		// Check cache first
		if (this.cache.has(cacheKey)) {
			const cached = this.cache.get(cacheKey);
			if (Date.now() - cached.timestamp < this.cacheTimeout) {
				return cached.available;
			}
		}

		try {
			let query = supabase
				.from('Appointment')
				.select('id')
				.eq('preferredDate', dateString)
				.eq('preferredTime', timeSlot)
				.eq('consultationMethod', consultationMethod);

			// Fix: Only add .eq('medicalCenter', ...) if medicalCenter is not null/undefined/empty string
			if (consultationMethod === 'offline') {
				query = query.eq('medicalCenter', medicalCenter);
			} else {
				// For online, ensure medicalCenter is null in DB
				query = query.is('medicalCenter', null);
			}

			const { data, error } = await query;

			if (error) {
				console.error('Error checking slot availability:', error);
				return false;
			}

			const isAvailable = !data || data.length === 0;

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

	// Get all available slots for a date and consultation method
	async getAvailableSlotsForDate(dateString, consultationMethod, medicalCenter = null) {
		const allSlots = this.getAvailableSlots(dateString, consultationMethod, medicalCenter);
		const availableSlots = [];

		for (const slot of allSlots) {
			// eslint-disable-next-line no-await-in-loop
			const isAvailable = await this.isSlotAvailable(dateString, slot, consultationMethod, medicalCenter);
			if (isAvailable) {
				availableSlots.push(slot);
			}
		}

		return availableSlots;
	}

	// Book a slot (mark as unavailable)
	async bookSlot(dateString, timeSlot, consultationMethod, medicalCenter = null) {
		const isAvailable = await this.isSlotAvailable(dateString, timeSlot, consultationMethod, medicalCenter);

		if (!isAvailable) {
			throw new Error('Slot is no longer available');
		}

		// Clear cache for this slot
		const cacheKey = `slot_${dateString}_${timeSlot}_${consultationMethod}_${medicalCenter || 'online'}`;
		this.cache.delete(cacheKey);

		return true;
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

		// Initialize center tracking
		Object.values(MEDICAL_CENTERS).forEach(center => {
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

		// Make the function async and parallelize slot availability checks for speed
		for (const date of dates) {
			summary.byDate[date] = {
				online: { total: 0, booked: 0, available: 0 },
				offline: {}
			};

			// Check online slots in parallel
			const onlineSlots = this.getAvailableSlots(date, 'online');
			const onlineSlotChecks = onlineSlots.map(slot =>
				this.isSlotAvailable(date, slot, 'online').then(isAvailable => ({
					slot,
					isAvailable
				}))
			);
			const onlineResults = await Promise.all(onlineSlotChecks);
			for (const { isAvailable } of onlineResults) {
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

			// Check offline slots for each center in parallel
			await Promise.all(
				Object.values(MEDICAL_CENTERS).map(async center => {
					summary.byDate[date].offline[center.id] = { total: 0, booked: 0, available: 0 };

					const offlineSlots = this.getAvailableSlots(date, 'offline', center.id);
					const offlineSlotChecks = offlineSlots.map(slot =>
						this.isSlotAvailable(date, slot, 'offline', center.id).then(isAvailable => ({
							slot,
							isAvailable
						}))
					);
					const offlineResults = await Promise.all(offlineSlotChecks);
					for (const { isAvailable } of offlineResults) {
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
				})
			);
		}

		return summary;
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

export const getAvailableSlots = (dateString, appointmentType, medicalCenter = null) => {
	return slotManager.getAvailableSlots(dateString, appointmentType, medicalCenter)
}

export const isSlotAvailable = async (dateString, timeSlot, appointmentType, medicalCenter = null) => {
	return slotManager.isSlotAvailable(dateString, timeSlot, appointmentType, medicalCenter)
}

export const bookSlot = async (dateString, timeSlot, appointmentType, medicalCenter = null) => {
	return slotManager.bookSlot(dateString, timeSlot, appointmentType, medicalCenter)
}

export const getAvailableDates = (bookingRange = 30) => {
	return slotManager.getAvailableDates(bookingRange)
}
