import { supabase } from "../supabase"

const TABLE = "hospitals"

export async function getAllHospitalsAsync() {
	const { data, error } = await supabase
		.from(TABLE)
		.select("id, name, address, phone, doctorSchedule")
		.order("name", { ascending: true })

	if (error) throw error
	return Array.isArray(data) ? data : []
}

export async function createHospital(hospitalData) {
	if (!hospitalData) throw new Error("Hospital data is required")

	const newHospital = {
		...hospitalData,
		doctorSchedule: hospitalData.doctorSchedule || {
			monday: null,
			tuesday: null,
			wednesday: null,
			thursday: null,
			friday: null,
			saturday: null,
			sunday: null,
		},
	}

	const { error } = await supabase.from(TABLE).insert(newHospital)
	if (error) throw error

	return true
}

export async function updateHospitalById(id, hospitalData) {
	if (!id) throw new Error("Hospital ID is required")
	if (!hospitalData) throw new Error("Hospital data is required")

	const updateData = {
		name: hospitalData.name,
		address: hospitalData.address,
		phone: hospitalData.phone,
		doctorSchedule: hospitalData.doctorSchedule,
	}

	const { error } = await supabase.from(TABLE).update(updateData).eq("id", id)
	if (error) throw error

	return true
}

export async function deleteHospitalById(id) {
	if (!id) throw new Error("Hospital ID is required")
	const { error } = await supabase.from(TABLE).delete().eq("id", id)
	if (error) throw error

	return true
}