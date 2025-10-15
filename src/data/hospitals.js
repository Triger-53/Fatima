// Unified hospitals provider backed by Supabase.
import { supabase } from "../supabase"

const TABLE = "hospitals"

// Async API for consumers that want fresh data reliably (no background race)
export async function getAllHospitalsAsync() {
	const { data, error } = await supabase
		.from(TABLE)
		.select("id, name, address, phone")
		.order("name", { ascending: true })

	if (error) throw error

	return Array.isArray(data) ? data : []
}

// Create a new hospital in Supabase
export async function createHospital(hospitalData) {
	if (!hospitalData) throw new Error("Hospital data is required")

	const { error } = await supabase.from(TABLE).insert(hospitalData)
	if (error) throw error

	return true
}

// Update a single hospital in Supabase
export async function updateHospitalById(id, hospitalData) {
	if (!id) throw new Error("Hospital ID is required")
	if (!hospitalData) throw new Error("Hospital data is required")

	const { error } = await supabase
		.from(TABLE)
		.update(hospitalData)
		.eq("id", id)
	if (error) throw error

	return true
}

// Delete a hospital by ID from Supabase
export async function deleteHospitalById(id) {
	if (!id) throw new Error("Hospital ID is required")
	const { error } = await supabase.from(TABLE).delete().eq("id", id)
	if (error) throw error

	return true
}
