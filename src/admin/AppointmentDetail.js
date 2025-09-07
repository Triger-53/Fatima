import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

const AppointmentDetail = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [appointment, setAppointment] = useState(null)

	useEffect(() => {
		const fetchAppointment = async () => {
			const { data, error } = await supabase
				.from("Appointment")
				.select("*")
				.eq("id", id)
				.single()

			if (error) console.error(error)
			else setAppointment(data)
		}

		fetchAppointment()
	}, [id])

	if (!appointment) return <p className="p-6">Loading...</p>

	return (
		<div className="p-6 bg-gray-50 min-h-screen">


			<div className="bg-white shadow-md rounded-lg p-6 space-y-4">
				<h2 className="text-2xl font-bold">
					{appointment.firstName} {appointment.lastName}
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<p>
						<strong>Gender:</strong> {appointment.gender || "N/A"}
					</p>
					<p>
						<strong>Birthday:</strong> {appointment.dateOfBirth || "N/A"}
					</p>
					<p>
						<strong>New Patient:</strong> {appointment.isNewPatient || "N/A"}
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
			</div>
		</div>
	)
}

export default AppointmentDetail
