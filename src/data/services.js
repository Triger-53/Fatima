// Unified services provider backed by Supabase.
import { supabase } from "../supabase"

const TABLE = "services"

/**
 * A robust helper to extract the price from a service object.
 * It handles multiple possible data structures for the price property.
 * @param {object} service - The service object.
 * @returns {number} The price of the service, defaulting to 500 if not found.
 */
export function getServicePrice(service) {
	if (!service || service.price == null) {
		return 500 // Default price
	}

	// Case 1: price is a number (preferred format)
	if (typeof service.price === "number") {
		return service.price
	}

	// Case 2: price is an object (legacy format from old data structures)
	if (typeof service.price === "object" && service.price !== null) {
		if (service.price.inr && service.price.inr.min != null) {
			return service.price.inr.min
		}
		if (service.price.min != null) {
			return service.price.min
		}
	}

	// Fallback to default price if the structure is unexpected
	return 500
}

// Publish array of services to Supabase (upsert by id)
export async function publishAllServices(services) {
	if (!Array.isArray(services)) throw new Error("Invalid services payload")
	const isValidUuid = (v) =>
		typeof v === "string" && /^[0-9a-fA-F-]{36}$/.test(v)

	// Separate services with valid UUIDs (for upsert) from new services (for insert)
	const servicesToUpsert = []
	const servicesToInsert = []

	services.forEach((s) => {
		const priceValue = Number(s?.price || 0)

		const row = {
			title: s.title,
			description: s.description || "",
			features: Array.isArray(s.features) ? s.features : [],
			duration: s.duration || "",
			price: priceValue, // Store as single number in jsonb
			icon: s.icon || "Heart",
			appointmentType: s.appointmentType || "",
		}

		if (isValidUuid(s.id)) {
			row.id = s.id
			servicesToUpsert.push(row)
		} else {
			servicesToInsert.push(row)
		}
	})

	// Upsert existing services
	if (servicesToUpsert.length > 0) {
		const { error: upsertError } = await supabase
			.from(TABLE)
			.upsert(servicesToUpsert, { onConflict: "id" })
		if (upsertError) throw upsertError
	}

	// Insert new services (let Supabase generate UUIDs)
	if (servicesToInsert.length > 0) {
		const { error: insertError } = await supabase
			.from(TABLE)
			.insert(servicesToInsert)
		if (insertError) throw insertError
	}

	return true
}

// Delete a service by ID from Supabase
export async function deleteServiceById(id) {
	if (!id) throw new Error("Service ID is required")
	const { error } = await supabase.from(TABLE).delete().eq("id", id)
	if (error) throw error

	return true
}

// Update a single service in Supabase
export async function updateServiceById(id, serviceData) {
	if (!id) throw new Error("Service ID is required")
	if (!serviceData) throw new Error("Service data is required")

	const priceValue = Number(serviceData?.price || 0)

	const updateData = {
		title: serviceData.title,
		description: serviceData.description || "",
		features: Array.isArray(serviceData.features) ? serviceData.features : [],
		duration: serviceData.duration || "",
		price: priceValue, // Store as single number in jsonb
		icon: serviceData.icon || "Heart",
		appointmentType: serviceData.appointmentType || "",
	}

	const { error } = await supabase.from(TABLE).update(updateData).eq("id", id)
	if (error) throw error

	return true
}

// Async API for consumers that want fresh data reliably (no background race)
export async function getAllServicesAsync() {
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			"id, title, description, features, duration, price, icon, appointmentType"
		)
		.order("title", { ascending: true })

	if (error) throw error

	const rows = Array.isArray(data) ? data : []
	// Map DB rows to app's expected shape
	return rows.map((row) => {
		// Handle price as single number from jsonb column
		const priceValue = Number(row?.price || 0)
		return {
			id: row.id,
			title: row.title,
			description: row.description || "",
			features: Array.isArray(row.features) ? row.features : [],
			duration: row.duration || "",
			icon: row.icon || "Heart",
			appointmentType: row.appointmentType || "",
			// Store single price value for admin UI
			price: priceValue,
			// price object maintains backwards compatibility with existing UI
			priceObject: {
				min: priceValue,
				max: priceValue,
				inr: { min: priceValue, max: priceValue },
			},
		}
	})
}
