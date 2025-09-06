import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { Calendar, Clock, FileText } from "lucide-react"
import AdminNav from "./AdminNav"

const Appointments = () => {
	const [appointments, setAppointments] = useState([])
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()

	useEffect(() => {
		const fetchAppointments = async () => {
			setLoading(true)
			const { data, error } = await supabase
				.from("Appointment")
				.select("*")
				.order("preferredDate", { ascending: true })

			if (error) console.error(error)
			else setAppointments(data)
			setLoading(false)
		}

		fetchAppointments()
	}, [])

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			
			<AdminNav />

			{/* Heading */}
			<div className="mb-6 p-6 rounded-lg text-white bg-blue-600 shadow-md">
				<h1 className="text-3xl font-bold text-center">Appointments</h1>
			</div>

			{/* Loading */}
			{loading ? (
				<p className="text-gray-600">Loading appointments...</p>
			) : appointments.length === 0 ? (
				<p className="text-gray-600">No appointments found.</p>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{appointments.map((appt) => (
						<div
							key={appt.id}
							onClick={() => navigate(`/admin/appointments/${appt.id}`)}
							className="bg-white shadow-lg rounded-xl p-5 cursor-pointer hover:shadow-2xl transition transform hover:-translate-y-1">
							<div className="flex items-center justify-between mb-3">
								<h2 className="text-xl font-semibold text-gray-800">
									{appt.firstName} {appt.lastName}
								</h2>
								<span className="text-sm text-gray-500">
									{appt.isNewPatient === "yes" ? "New Patient" : "Existing"}
								</span>
							</div>

							<div className="flex items-center text-gray-600 text-sm mb-2">
								<Calendar className="w-4 h-4 mr-1" />
								<span>{appt.preferredDate}</span>
							</div>

							<div className="flex items-center text-gray-600 text-sm mb-2">
								<Clock className="w-4 h-4 mr-1" />
								<span>{appt.preferredTime}</span>
							</div>

							<div className="flex items-center text-gray-600 text-sm mb-2">
								<FileText className="w-4 h-4 mr-1" />
								<span>{appt.appointmentType}</span>
							</div>

							<p className="text-gray-700 mt-3 text-sm line-clamp-2">
								<strong>Reason:</strong> {appt.reason || "N/A"}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default Appointments
