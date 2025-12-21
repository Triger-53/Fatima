import React, { useEffect, useState } from "react"
import { supabase } from "../supabase"
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
	Filler,
} from "chart.js"
import { Pie, Doughnut, Bar, Line } from "react-chartjs-2"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import { Users, Calendar, BarChart3, TrendingUp, UserPlus, UserCheck } from "lucide-react"

ChartJS.register(
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	PointElement,
	LineElement,
	Filler
)

const Analytics = () => {
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

	// Stats logic
	const totalAppointments = appointments.length
	const newPatients = appointments.filter((a) => a.isNewPatient === "yes").length
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

	// Monthly data (simplified for last 6 months)
	const getMonthlyData = () => {
		const monthlyCounts = {}
		const now = new Date()
		for (let i = 5; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
			const monthName = d.toLocaleString("default", { month: "short" })
			monthlyCounts[monthName] = 0
		}

		appointments.forEach((appt) => {
			const date = new Date(appt.date)
			const monthName = date.toLocaleString("default", { month: "short" })
			if (monthlyCounts.hasOwnProperty(monthName)) {
				monthlyCounts[monthName] += 1
			}
		})
		return monthlyCounts
	}

	const monthlyDataMap = getMonthlyData()

	// Chart Data configurations
	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "bottom",
				labels: {
					usePointStyle: true,
					padding: 20,
					font: { size: 12 },
				},
			},
		},
		scales: {
			x: { grid: { display: false } },
			y: {
				beginAtZero: true,
				grid: { color: "rgba(0,0,0,0.05)" }
			},
		},
	}

	const genderChartData = {
		labels: Object.keys(genderCounts),
		datasets: [
			{
				data: Object.values(genderCounts),
				backgroundColor: ["#06b6d4", "#f59e0b", "#10b981", "#8b5cf6"],
				hoverOffset: 4,
			},
		],
	}

	const patientTypeData = {
		labels: ["New", "Existing"],
		datasets: [
			{
				data: [newPatients, existingPatients],
				backgroundColor: ["#10b981", "#3b82f6"],
				borderWidth: 0,
			},
		],
	}

	const appointmentTypeData = {
		labels: Object.keys(typeCounts),
		datasets: [
			{
				label: "Appointments",
				data: Object.values(typeCounts),
				backgroundColor: "#3b82f6",
				borderRadius: 8,
			},
		],
	}

	const trendData = {
		labels: Object.keys(monthlyDataMap),
		datasets: [
			{
				label: "Monthly Trend",
				data: Object.values(monthlyDataMap),
				borderColor: "#06b6d4",
				backgroundColor: "rgba(6, 182, 212, 0.1)",
				fill: true,
				tension: 0.4,
				pointRadius: 4,
				pointBackgroundColor: "#06b6d4",
			},
		],
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<p className="text-gray-500 animate-pulse text-lg">Loading analytics data...</p>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">Analytics Overview</h1>
					<p className="text-gray-500 mt-1">Detailed insights into your practice performance</p>
				</div>
				<div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
					<TrendingUp className="w-4 h-4" />
					<span>Live Updates</span>
				</div>
			</motion.div>

			{/* Summary Cards */}
			<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-1">
				{[
					{
						label: "Total Appointments",
						value: totalAppointments,
						icon: <Calendar className="w-6 h-6 text-blue-600" />,
						color: "from-blue-50 to-white border-blue-100",
					},
				].map((stat, i) => (
					<motion.div
						key={i}
						whileHover={{ y: -5 }}
						className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} border shadow-sm max-w-sm mx-auto w-full`}>
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 bg-white rounded-lg shadow-sm border border-inherit">
								{stat.icon}
							</div>
							<span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Stats</span>
						</div>
						<h2 className="text-gray-600 font-medium mb-1">{stat.label}</h2>
						<p className="text-4xl font-bold text-gray-900">
							<CountUp end={stat.value} duration={2} />
						</p>
					</motion.div>
				))}
			</div>

			{/* Charts Grid */}
			<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
				{/* Trend Chart */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-bold text-gray-800">Appointment Trends</h3>
						<BarChart3 className="w-5 h-5 text-gray-400" />
					</div>
					<div className="h-[300px]">
						<Line data={trendData} options={chartOptions} />
					</div>
				</motion.div>

				{/* Distribution Chart */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-bold text-gray-800">Patient Breakdown</h3>
						<Users className="w-5 h-5 text-gray-400" />
					</div>
					<div className="h-[300px]">
						<Doughnut
							data={patientTypeData}
							options={{
								...chartOptions,
								cutout: "70%",
								scales: { x: { display: false }, y: { display: false } },
							}}
						/>
					</div>
				</motion.div>

				{/* Category Chart */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-bold text-gray-800">Appointment Types</h3>
						<TrendingUp className="w-5 h-5 text-gray-400" />
					</div>
					<div className="h-[300px]">
						<Bar
							data={appointmentTypeData}
							options={{
								...chartOptions,
								indexAxis: "y",
								plugins: { ...chartOptions.plugins, legend: { display: false } },
							}}
						/>
					</div>
				</motion.div>

				{/* Demographic Chart */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-bold text-gray-800">Demographic Split</h3>
						<Users className="w-5 h-5 text-gray-400" />
					</div>
					<div className="h-[300px]">
						<Pie
							data={genderChartData}
							options={{
								...chartOptions,
								scales: { x: { display: false }, y: { display: false } },
							}}
						/>
					</div>
				</motion.div>
			</div>
		</div>
	)
}

export default Analytics
