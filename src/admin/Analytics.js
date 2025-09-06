import React, { useEffect, useState } from "react"
import { supabase } from "../supabase"
import AdminNav from "./AdminNav"
import { useNavigate } from "react-router-dom"
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	PointElement,
	LineElement,
} from "chart.js"
import { Pie, Doughnut, Bar, Line } from "react-chartjs-2"
import { motion } from "framer-motion"
import CountUp from "react-countup"

ChartJS.register(
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	PointElement,
	LineElement
)

const Analytics = () => {
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

	// Gender distribution
	const genderCounts = appointments.reduce((acc, appt) => {
		const gender = appt.gender || "Unknown"
		acc[gender] = (acc[gender] || 0) + 1
		return acc
	}, {})

	// Appointment type distribution
	const typeCounts = appointments.reduce((acc, appt) => {
		const type = appt.appointmentType || "Other"
		acc[type] = (acc[type] || 0) + 1
		return acc
	}, {})

	// Appointments per weekday (Sunday = 0)
	const appointmentsByWeekday = new Array(7).fill(0)
	appointments.forEach((appt) => {
		const date = new Date(appt.date)
		const day = date.getDay() // 0 = Sun
		appointmentsByWeekday[day] += 1
	})

	// Map to Monday-first order for chart
	const dailyAppointments = [
		appointmentsByWeekday[1], // Mon
		appointmentsByWeekday[2], // Tue
		appointmentsByWeekday[3], // Wed
		appointmentsByWeekday[4], // Thu
		appointmentsByWeekday[5], // Fri
		appointmentsByWeekday[6], // Sat
		appointmentsByWeekday[0], // Sun
	]

	// Chart Data
	const genderChartData = {
		labels: Object.keys(genderCounts),
		datasets: [
			{
				data: Object.values(genderCounts),
				backgroundColor: ["#06b6d4", "#f59e0b", "#ef4444", "#10b981"], // cyan, amber, red, green
				borderWidth: 2,
			},
		],
	}

	const patientTypeData = {
		labels: ["New Patients", "Existing Patients"],
		datasets: [
			{
				data: [newPatients, existingPatients],
				backgroundColor: ["#22c55e", "#3b82f6"], // green vs blue
				borderWidth: 2,
			},
		],
	}

	const appointmentTypeData = {
		labels: Object.keys(typeCounts),
		datasets: [
			{
				label: "Appointments",
				data: Object.values(typeCounts),
				backgroundColor: [
					"#06b6d4",
					"#f43f5e",
					"#a855f7",
					"#facc15",
					"#10b981",
				],
			},
		],
	}

	const lineData = {
		labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		datasets: [
			{
				label: "Appointments per Day",
				data: dailyAppointments,
				borderColor: "#06b6d4",
				backgroundColor: "rgba(6, 182, 212, 0.25)",
				fill: true,
				tension: 0.4,
			},
		],
	}

	// Sparkline generator for summary cards
	const getSparklineData = (color) => ({
		labels: Array.from({ length: 7 }, (_, i) => i + 1),
		datasets: [
			{
				data: Array.from(
					{ length: 7 },
					() => Math.floor(Math.random() * 10) + 1
				),
				borderColor: color,
				backgroundColor: "transparent",
				borderWidth: 2,
				tension: 0.4,
				pointRadius: 0,
			},
		],
	})

	return (
		<div className="relative p-6 bg-gradient-to-br from-gray-950 via-black to-gray-900 min-h-screen text-white overflow-hidden">
			<div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#06b6d4_1px,transparent_1px)] bg-[length:30px_30px]" />

			<AdminNav />

			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				className="mb-10 p-6 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] border border-cyan-400/40">
				<h1 className="text-4xl font-extrabold text-center tracking-[0.2em] text-cyan-300 drop-shadow-[0_0_12px_#06b6d4]">
					🚀 Analytics Dashboard
				</h1>
				<p className="text-center text-sm mt-2 text-blue-300 opacity-80">
					Neon insights into your appointments
				</p>
			</motion.div>

			{loading ? (
				<p className="text-cyan-300 animate-pulse">Loading analytics...</p>
			) : totalAppointments === 0 ? (
				<p className="text-gray-300">No data available.</p>
			) : (
				<div className="space-y-12">
					{/* Summary Cards */}
					<div className="grid gap-6 md:grid-cols-3">
						{[
							{
								label: "Total Appointments",
								value: totalAppointments,
								color: "from-cyan-600/30 to-cyan-400/30",
								chartColor: "#06b6d4",
							},
							{
								label: "New Patients",
								value: newPatients,
								color: "from-blue-600/30 to-blue-400/30",
								chartColor: "#0ea5e9",
							},
							{
								label: "Existing Patients",
								value: existingPatients,
								color: "from-indigo-600/30 to-indigo-400/30",
								chartColor: "#1e3a8a",
							},
						].map((stat, i) => (
							<motion.div
								key={i}
								whileHover={{ scale: 1.05 }}
								className={`relative p-6 rounded-2xl bg-gradient-to-br ${stat.color} text-center overflow-hidden border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-lg`}>
								<h2 className="text-lg tracking-widest font-semibold text-cyan-200">
									{stat.label}
								</h2>
								<p className="text-6xl font-bold mt-3 text-cyan-100 drop-shadow-[0_0_15px_#06b6d4]">
									<CountUp end={stat.value} duration={2.5} />
								</p>
								<div className="mt-4 h-16">
									<Line
										data={getSparklineData(stat.chartColor)}
										options={{
											responsive: true,
											plugins: { legend: { display: false } },
											scales: { x: { display: false }, y: { display: false } },
										}}
									/>
								</div>
							</motion.div>
						))}
					</div>

					{/* Small Charts Grid */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{[
							{
								title: "Gender Distribution",
								component: (
									<Pie
										data={genderChartData}
										options={{ responsive: true, maintainAspectRatio: false }}
									/>
								),
								color: "from-cyan-600/10 to-blue-600/10 border-cyan-400/40",
								text: "text-cyan-300",
							},
							{
								title: "Patients Breakdown",
								component: (
									<Doughnut
										data={patientTypeData}
										options={{ responsive: true, maintainAspectRatio: false }}
									/>
								),
								color: "from-blue-600/10 to-cyan-600/10 border-blue-400/40",
								text: "text-blue-300",
							},
							{
								title: "Appointment Types",
								component: (
									<Bar
										data={appointmentTypeData}
										options={{
											responsive: true,
											maintainAspectRatio: false,
											plugins: { legend: { display: false } },
										}}
									/>
								),
								color: "from-indigo-600/10 to-cyan-600/10 border-indigo-400/40",
								text: "text-indigo-300",
							},
							{
								title: "Appointments Over Time",
								component: (
									<Line
										data={lineData}
										options={{
											responsive: true,
											maintainAspectRatio: false,
											plugins: { legend: { labels: { color: "white" } } },
											scales: {
												x: { ticks: { color: "white" } },
												y: { ticks: { color: "white" } },
											},
										}}
									/>
								),
								color: "from-cyan-600/10 to-blue-600/10 border-cyan-400/40",
								text: "text-cyan-300",
							},
						].map((chart, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.2 }}
								className={`p-4 h-64 bg-gradient-to-br ${chart.color} rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.3)] border`}>
								<h2 className={`text-lg font-bold ${chart.text} mb-2`}>
									{chart.title}
								</h2>
								<div className="h-48">{chart.component}</div>
							</motion.div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default Analytics
