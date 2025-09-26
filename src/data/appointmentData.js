// Medical Centers Data
export const MEDICAL_CENTERS = {
	SAIFEE_HOSPITAL: {
		id: 'saifee',
		name: 'Saifee Hospital',
		address: '15/17, Maharshi Karve Road, Marine Lines, Mumbai',
		phone: '+91 22 2200 0000',
		doctorSchedule: {
			monday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			tuesday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			wednesday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			thursday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			friday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			saturday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			sunday: null
		}
	},
	LILAVATI_HOSPITAL: {
		id: 'lilavati',
		name: 'Lilavati Hospital',
		address: 'A-791, Bandra Reclamation, Bandra West, Mumbai',
		phone: '+91 22 2675 1000',
		doctorSchedule: {
			monday: { start: '14:00', end: '17:00', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
			tuesday: { start: '14:00', end: '17:00', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
			wednesday: { start: '14:00', end: '17:00', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
			thursday: { start: '14:00', end: '17:00', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
			friday: { start: '14:00', end: '17:00', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
			saturday: null,
			sunday: null
		}
	},
	KOKILABEN_HOSPITAL: {
		id: 'kokilaben',
		name: 'Kokilaben Dhirubhai Ambani Hospital',
		address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai',
		phone: '+91 22 3099 9999',
		doctorSchedule: {
			monday: { start: '10:00', end: '13:00', slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'] },
			tuesday: { start: '10:00', end: '13:00', slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'] },
			wednesday: { start: '10:00', end: '13:00', slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'] },
			thursday: { start: '10:00', end: '13:00', slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'] },
			friday: { start: '10:00', end: '13:00', slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'] },
			saturday: null,
			sunday: null
		}
	}
}

// Online appointment slots
export const ONLINE_SLOTS = {
	monday: { start: '09:00', end: '18:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
	tuesday: { start: '09:00', end: '18:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
	wednesday: { start: '09:00', end: '18:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
	thursday: { start: '09:00', end: '18:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
	friday: { start: '09:00', end: '18:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
	saturday: { start: '09:00', end: '14:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'] },
	sunday: null
}