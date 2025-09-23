import servicesData from "../data/services.json"

const LS_KEY = "servicesOverride"

export function getAllServices() {
	try {
		const raw = localStorage.getItem(LS_KEY)
		if (raw) {
			const parsed = JSON.parse(raw)
			if (Array.isArray(parsed?.services)) return parsed.services
		}
	} catch (_) {}
	return servicesData.services
}

export function saveAllServices(services) {
	if (!Array.isArray(services)) return false
	try {
		localStorage.setItem(LS_KEY, JSON.stringify({ services }))
		return true
	} catch (_) {
		return false
	}
}

export function resetServicesToDefault() {
	try {
		localStorage.removeItem(LS_KEY)
		return true
	} catch (_) {
		return false
	}
}

export function getServiceByAppointmentType(appointmentType) {
	const services = getAllServices()
	return services.find((s) => s.appointmentType === appointmentType)
}
