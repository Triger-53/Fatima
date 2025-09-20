import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

const AppointmentDetail = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [appointment, setAppointment] = useState(null)
	const [editing, setEditing] = useState(false)
	const [formData, setFormData] = useState({})

	useEffect(() => {
		const fetchAppointment = async () => {
			const { data, error } = await supabase
				.from("Appointment")
				.select("*")
				.eq("id", id)
				.single()

			if (error) console.error(error)
			else {
				setAppointment(data)
				setFormData(data) // preload form for editing
			}
		}

		fetchAppointment()
	}, [id])

	const handleDelete = async () => {
		if (!window.confirm("Are you sure you want to delete this appointment?"))
			return

		const { error } = await supabase.from("Appointment").delete().eq("id", id)
		if (error) console.error(error)
		else navigate("/admin/appointments") // go back to list
	}

	const handleUpdate = async (e) => {
		e.preventDefault()
		const { error } = await supabase
			.from("Appointment")
			.update(formData)
			.eq("id", id)
		if (error) console.error(error)
		else {
			setAppointment(formData)
			setEditing(false)
		}
	}

	if (!appointment) return <p className="p-6">Loading...</p>

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<div className="bg-white shadow-md rounded-lg p-6 space-y-4">
				<h2 className="text-2xl font-bold">
					{appointment.firstName} {appointment.lastName}
				</h2>

				{/* Normal view */}
				{!editing ? (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<p>
								<strong>Gender:</strong> {appointment.gender || "N/A"}
							</p>
							<p>
								<strong>Birthday:</strong> {appointment.dateOfBirth || "N/A"}
							</p>
							<p>
								<strong>New Patient:</strong>{" "}
								{appointment.isNewPatient || "N/A"}
							</p>
							<p>
								<strong>Phone:</strong> {appointment.phone}
							</p>
							<p>
								<strong>Email:</strong> {appointment.email}
							</p>
							<p>
								<strong>Appointment Type:</strong> {appointment.appointmentType}
							</p>
							<p>
								<strong>Date & Time:</strong> {appointment.preferredDate} at{" "}
								{appointment.preferredTime}
							</p>
						</div>

						<p>
							<strong>Reason:</strong> {appointment.reason || "N/A"}
						</p>
						<p>
							<strong>Symptoms:</strong> {appointment.symptoms || "N/A"}
						</p>
						<p>
							<strong>Medications:</strong>{" "}
							{appointment.currentMedications || "N/A"}
						</p>
						<p>
							<strong>Allergies:</strong> {appointment.allergies || "N/A"}
						</p>
						<p>
							<strong>Medical History:</strong>{" "}
							{appointment.medicalHistory || "N/A"}
						</p>

						<div className="flex gap-4 mt-6">
							<button
								onClick={() => setEditing(true)}
								className="bg-blue-500 text-white px-4 py-2 rounded-3xl hover:bg-blue-600">
								Edit
							</button>
							<button
								onClick={handleDelete}
								className="bg-red-500 text-white px-4 py-2 rounded-3xl hover:bg-red-600">
								Delete
							</button>
						</div>
					</>
				) : (
					/* Edit form */
					<form onSubmit={handleUpdate} className="space-y-4">
						{/* First Name */}
						<input
							type="text"
							value={formData.firstName}
							onChange={(e) =>
								setFormData({ ...formData, firstName: e.target.value })
							}
							placeholder="First Name"
							className="border p-2 w-full rounded-3xl"
						/>

						{/* Last Name */}
						<input
							type="text"
							value={formData.lastName}
							onChange={(e) =>
								setFormData({ ...formData, lastName: e.target.value })
							}
							placeholder="Last Name"
							className="border p-2 w-full rounded-3xl"
						/>

						{/* Gender */}
						<select
							value={formData.gender || ""}
							onChange={(e) =>
								setFormData({ ...formData, gender: e.target.value })
							}
							className="border p-2 w-full rounded-3xl">
							<option value="">Select Gender</option>
							<option value="male">Male</option>
							<option value="female">Female</option>
							<option value="other">Other</option>
						</select>

						{/* Birthday */}
						<input
							type="date"
							value={formData.dateOfBirth || ""}
							onChange={(e) =>
								setFormData({ ...formData, dateOfBirth: e.target.value })
							}
							className="border p-2 w-full rounded-3xl"
						/>

						{/* New Patient */}
						<select
							value={formData.isNewPatient || ""}
							onChange={(e) =>
								setFormData({ ...formData, isNewPatient: e.target.value })
							}
							className="border p-2 w-full rounded-3xl">
							<option value="">New Patient?</option>
							<option value="yes">Yes</option>
							<option value="no">No</option>
						</select>

						{/* Phone */}
						<input
							type="text"
							value={formData.phone}
							onChange={(e) =>
								setFormData({ ...formData, phone: e.target.value })
							}
							placeholder="Phone"
							className="border p-2 w-full rounded-3xl"
						/>

						{/* Email */}
						<input
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							placeholder="Email"
							className="border p-2 w-full rounded-3xl"
						/>

						{/* Appointment Type */}
						<input
							type="text"
							value={formData.appointmentType}
							onChange={(e) =>
								setFormData({ ...formData, appointmentType: e.target.value })
							}
							placeholder="Appointment Type"
							className="border p-2 w-full rounded-3xl"
						/>

						{/* Date */}
						<input
							type="date"
							value={formData.preferredDate || ""}
							onChange={(e) =>
								setFormData({ ...formData, preferredDate: e.target.value })
							}
							className="border p-2 w-full rounded-3xl"
						/>

						{/* Time */}
						<input
							type="time"
							value={formData.preferredTime || ""}
							onChange={(e) =>
								setFormData({ ...formData, preferredTime: e.target.value })
							}
							className="border p-2 w-full rounded-3xl"
						/>

						{/* Reason */}
						<textarea
							value={formData.reason}
							onChange={(e) =>
								setFormData({ ...formData, reason: e.target.value })
							}
							placeholder="Reason for appointment"
							className="border p-2 w-full rounded-3xl"
						/>

						{/* Symptoms */}
						<textarea
							value={formData.symptoms}
							onChange={(e) =>
								setFormData({ ...formData, symptoms: e.target.value })
							}
							placeholder="Symptoms"
							className="border p-2 w-full rounded-3xl"
						/>

						{/* Current Medications */}
						<textarea
							value={formData.currentMedications}
							onChange={(e) =>
								setFormData({
									...formData,
									currentMedications: e.target.value,
								})
							}
							placeholder="Current Medications"
							className="border p-2 w-full rounded-3xl"
						/>

						{/* Allergies */}
						<textarea
							value={formData.allergies}
							onChange={(e) =>
								setFormData({ ...formData, allergies: e.target.value })
							}
							placeholder="Allergies"
							className="border p-2 w-full rounded-3xl"
						/>

						{/* Medical History */}
						<textarea
							value={formData.medicalHistory}
							onChange={(e) =>
								setFormData({ ...formData, medicalHistory: e.target.value })
							}
							placeholder="Medical History"
							className="border p-2 w-full rounded-3xl"
						/>
						<div className="flex gap-4">
							<button
								type="submit"
								className="bg-green-500 text-white px-4 py-2 rounded-3xl hover:bg-green-600">
								Save
							</button>
							<button
								type="button"
								onClick={() => setEditing(false)}
								className="bg-gray-500 text-white px-4 py-2 rounded-3xl hover:bg-gray-600">
								Cancel
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	)
}

export default AppointmentDetail
