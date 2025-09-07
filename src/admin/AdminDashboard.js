import React, { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { useNavigate } from "react-router-dom"
import AdminNav from "./AdminNav"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import { Calendar, BarChart3, Users } from "lucide-react"

const AdminDashboard = () => {
	const [appointments, setAppointments] = useState([])
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()

	useEffect(() => {
		const fetchAppointments = async () => {
			setLoading(true)
			const { data, error } = await supabase.from("Appointment").select("*")
			if (error) console.error(error)
			else setAppointments(data)
			setLoading(false)
		}
		fetchAppointments()
	}, [])

	// Stats
	const totalAppointments = appointments.length
	const newPatients = appointments.filter(
		(a) => a.isNewPatient === "yes"
	).length
	const existingPatients = totalAppointments - newPatients

	const cards = [
		{
			label: "Total Appointments",
			value: totalAppointments,
			icon: <Calendar className="w-8 h-8 text-cyan-400" />,
			color: "from-cyan-600/20 to-blue-600/20",
		},
		{
			label: "New Patients",
			value: newPatients,
			icon: <Users className="w-8 h-8 text-green-400" />,
			color: "from-green-600/20 to-emerald-600/20",
		},
		{
			label: "Existing Patients",
			value: existingPatients,
			icon: <Users className="w-8 h-8 text-indigo-400" />,
			color: "from-indigo-600/20 to-purple-600/20",
		},
	]

	return (
		<div className="relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen overflow-hidden">
			<div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,#06b6d4_1px,transparent_1px)] bg-[length:30px_30px]" />

			<AdminNav />

			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7 }}
				className="mb-8 text-center">
				<h1 className="text-4xl font-extrabold text-gray-800">
					Welcome to Your Dashboard
				</h1>
				<p className="text-gray-500 mt-2">
					Quick snapshot of your appointments & patients
				</p>
			</motion.div>

			{/* Summary Cards */}
			{loading ? (
				<p className="text-gray-600 animate-pulse">Loading dashboard...</p>
			) : (
				<div className="grid gap-6 md:grid-cols-3 mb-10">
					{cards.map((card, i) => (
						<motion.div
							key={i}
							whileHover={{ scale: 1.05 }}
							className={`p-6 rounded-xl bg-gradient-to-br ${card.color} shadow-md border border-gray-200`}>
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold text-gray-700">
									{card.label}
								</h2>
								{card.icon}
							</div>
							<p className="text-5xl font-bold mt-4 text-gray-900">
								<CountUp end={card.value} duration={2} />
							</p>
						</motion.div>
					))}
				</div>
			)}

			{/* Quick Links */}
			<div className="grid gap-6 md:grid-cols-2">
				<motion.div
					whileHover={{ scale: 1.02 }}
					onClick={() => navigate("/admin/appointments")}
					className="cursor-pointer p-6 bg-white rounded-xl shadow hover:shadow-lg border border-gray-200">
					<div className="flex items-center mb-3">
						<Calendar className="w-6 h-6 text-blue-500 mr-2" />
						<h2 className="text-xl font-semibold text-gray-800">
							View Appointments
						</h2>
					</div>
					<p className="text-gray-600 text-sm">
						Manage upcoming and past appointments in detail.
					</p>
				</motion.div>

				<motion.div
					whileHover={{ scale: 1.02 }}
					onClick={() => navigate("/admin/analytics")}
					className="cursor-pointer p-6 bg-white rounded-xl shadow hover:shadow-lg border border-gray-200">
					<div className="flex items-center mb-3">
						<BarChart3 className="w-6 h-6 text-cyan-500 mr-2" />
						<h2 className="text-xl font-semibold text-gray-800">
							View Analytics
						</h2>
					</div>
					<p className="text-gray-600 text-sm">
						Explore insights and trends from your appointments.
					</p>
				</motion.div>
			</div>
		</div>
	)
}

export default AdminDashboard
