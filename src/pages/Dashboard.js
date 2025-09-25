// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthProvider"
import { supabase } from "../supabase"
import {
	FaUserCircle,
	FaCalendarAlt,
	FaChalkboardTeacher,
	FaHourglassHalf,
	FaEnvelope,
	FaPrescriptionBottle,
} from "react-icons/fa"

export default function Dashboard() {
	const { user, signOut } = useAuth()
	const [dashboard, setDashboard] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (!user) return
		setLoading(true)

		supabase
			.from("user_dashboard")
			.select("*")
			.eq("user_id", user.id)
			.single()
			.then(({ data, error }) => {
				if (error) setError(error.message)
				else setDashboard(data)
				setLoading(false)
			})
	}, [user])

	if (!user)
		return (
			<p className="text-center mt-10 text-gray-600">
				Please log in to view your dashboard.
			</p>
		)

	const fullName = dashboard
		? [dashboard.firstName, dashboard.lastName].filter(Boolean).join(" ")
		: "Loading..."

	return (
		<div className="max-w-6xl mx-auto px-4 py-10">
			<div className="bg-white shadow-2xl rounded-3xl p-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
					<div className="flex items-center gap-4 mb-4 sm:mb-0">
						<FaUserCircle className="text-6xl text-indigo-500" />
						<div>
							<h2 className="text-3xl font-bold text-gray-900 mb-1">
								Welcome, {fullName}
							</h2>
							<p className="text-gray-600">Your personal health dashboard</p>
						</div>
					</div>
					<button
						onClick={() => signOut().catch((err) => console.error(err))}
						className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow transition-all hover:shadow-lg">
						Log out
					</button>
				</div>

				{loading && (
					<p className="text-gray-500 animate-pulse">Loading dashboard...</p>
				)}
				{error && <p className="text-red-600">{error}</p>}

				{dashboard && (
					<div className="space-y-12">
						{/* Personal Info Section */}
						<section>
							<h3 className="text-2xl font-semibold text-indigo-600 mb-6 flex items-center gap-2 border-b pb-2">
								<FaUserCircle /> Personal Info
							</h3>
							<InfoCard
								value={[
									`👤 Full Name: ${fullName}`,
									dashboard.email ? `📧 Email: ${dashboard.email}` : null,
									dashboard.phone ? `📞 Phone: ${dashboard.phone}` : null,
									dashboard.dateOfBirth
										? `🎂 DOB: ${dashboard.dateOfBirth}`
										: null,
									dashboard.gender ? `⚧ Gender: ${dashboard.gender}` : null,
									dashboard.allergies
										? `🤧 Allergies: ${dashboard.allergies}`
										: null,
									dashboard.medicalHistory
										? `📝 Medical History: ${dashboard.medicalHistory}`
										: null,
								]}
								fullWidth
							/>
						</section>

						{/* Appointments & Sessions Section */}
						<section>
							<h3 className="text-2xl font-semibold text-green-600 mb-6 flex items-center gap-2 border-b pb-2">
								<FaCalendarAlt /> Appointments & Sessions
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
								<InfoCard
									label="📅 Appointments"
									value={dashboard.appointments || "-"}
								/>
								<InfoCard
									label="🧑‍🏫 Sessions"
									value={dashboard.sessions || "-"}
								/>
								<InfoCard
									label="⏳ Follow-Up"
									value={dashboard.followUp || "-"}
								/>
							</div>
						</section>

						{/* Doctor Notes Section */}
						<section>
							<h3 className="text-2xl font-semibold text-purple-600 mb-6 flex items-center gap-2 border-b pb-2">
								<FaEnvelope /> Doctor Notes
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
								<InfoCard
									label="📝 Messages"
									value={dashboard.message || "-"}
								/>
								<InfoCard
									label="💊 Prescriptions"
									value={dashboard.prescribe || "-"}
								/>
							</div>
						</section>
					</div>
				)}
			</div>
		</div>
	)
}

// Reusable card component
function InfoCard({ label, value, fullWidth }) {
	let displayValue
	if (Array.isArray(value)) {
		displayValue = value.filter(Boolean).join("\n")
	} else {
		displayValue = value ?? "-"
	}

	return (
		<div
			className={`bg-white p-6 rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-shadow duration-300 ${
				fullWidth ? "w-full" : "w-full sm:w-auto"
			}`}>
			{label && (
				<p className="text-sm text-gray-500 mb-2 font-medium">{label}</p>
			)}
			<p className="text-gray-900 whitespace-pre-line break-words">
				{displayValue}
			</p>
		</div>
	)
}
