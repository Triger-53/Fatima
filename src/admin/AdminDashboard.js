import React, { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import { Calendar, BarChart3, Users, Bot, Sparkles } from "lucide-react"

const AdminDashboard = () => {
	const [appointments, setAppointments] = useState([])
	const [loading, setLoading] = useState(true)

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
		},
		{
			label: "New Patients",
			value: newPatients,
			icon: <Users className="w-8 h-8 text-green-400" />,
		},
		{
			label: "Existing Patients",
			value: existingPatients,
			icon: <Users className="w-8 h-8 text-indigo-400" />,
		},
	]

	return (
		<div>
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

			{loading ? (
				<p className="text-gray-600 animate-pulse">Loading dashboard...</p>
			) : (
				<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 mb-10">
					{cards.map((card, i) => (
						<motion.div
							key={i}
							whileHover={{ scale: 1.05 }}
							className="p-6 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 shadow-md border border-gray-200">
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

			<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<NavLink
					to="/admin/appointments"
					className="cursor-pointer p-6 bg-white rounded-xl shadow hover:shadow-lg border border-gray-200 flex flex-col justify-between transition-all hover:border-blue-200">
					<div className="flex items-center mb-3">
						<Calendar className="w-6 h-6 text-blue-500 mr-2" />
						<h2 className="text-xl font-semibold text-gray-800">
							Appointments
						</h2>
					</div>
					<p className="text-gray-600 text-sm">
						Manage upcoming and past appointments in detail.
					</p>
				</NavLink>

				<NavLink
					to="/admin/analytics"
					className="cursor-pointer p-6 bg-white rounded-xl shadow hover:shadow-lg border border-gray-200 flex flex-col justify-between transition-all hover:border-cyan-200">
					<div className="flex items-center mb-3">
						<BarChart3 className="w-6 h-6 text-cyan-500 mr-2" />
						<h2 className="text-xl font-semibold text-gray-800">
							Analytics
						</h2>
					</div>
					<p className="text-gray-600 text-sm">
						Explore insights and trends from your appointments.
					</p>
				</NavLink>

				<NavLink
					to="/admin/ai-chat"
					className="cursor-pointer p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg hover:shadow-xl flex flex-col justify-between transition-all transform hover:scale-[1.02] group lg:col-span-1">
					<div className="flex items-center mb-3">
						<Bot className="w-6 h-6 text-white mr-2" />
						<h2 className="text-xl font-semibold text-white">
							AI Assistant
						</h2>
					</div>
					<p className="text-blue-100 text-sm">
						Chat with your data-aware assistant to get instant insights.
					</p>
					<div className="mt-4 flex items-center text-white text-xs font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						Open Chat <Sparkles className="w-3 h-3" />
					</div>
				</NavLink>
			</div>
		</div>
	)
}

export default AdminDashboard
