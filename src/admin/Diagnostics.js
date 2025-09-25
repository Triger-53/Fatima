// src/admin/Diagnostics.js
import React, { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Diagnostics() {
	const [users, setUsers] = useState([])
	const [selectedUser, setSelectedUser] = useState("")
	const [message, setMessage] = useState("")
	const [prescription, setPrescription] = useState("")
	const [followUp, setFollowUp] = useState("")
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(null)
	const [error, setError] = useState(null)

	useEffect(() => {
		// Fetch all users for admin selection
		const fetchUsers = async () => {
			const { data, error } = await supabase
				.from("user_dashboard")
				.select("user_id, firstName, lastName, email")
				.order("firstName", { ascending: true })
			if (error) console.error(error)
			else setUsers(data)
		}

		fetchUsers()
	}, [])

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!selectedUser) return alert("Select a user first!")
		setLoading(true)
		setSuccess(null)
		setError(null)

		const { error } = await supabase
			.from("user_dashboard")
			.update({
				message: message || null,
				prescribe: prescription || null,
				followUp: followUp || null,
			})
			.eq("user_id", selectedUser)

		if (error) setError(error.message)
		else {
			setSuccess("User dashboard updated successfully!")
			setMessage("")
			setPrescription("")
			setFollowUp("")
		}

		setLoading(false)
	}

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<h2 className="text-3xl font-bold text-gray-900 mb-6">
				Diagnostics Panel
			</h2>
			<form
				onSubmit={handleSubmit}
				className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
				{/* User selection */}
				<div>
					<label className="block mb-2 font-medium text-gray-700">
						Select User
					</label>
					<select
						className="w-full border border-gray-300 rounded-lg px-3 py-2"
						value={selectedUser}
						onChange={(e) => setSelectedUser(e.target.value)}>
						<option value="">-- Select a user --</option>
						{users.map((user) => (
							<option key={user.user_id} value={user.user_id}>
								{user.firstName} {user.lastName} ({user.email})
							</option>
						))}
					</select>
				</div>

				{/* Message */}
				<div>
					<label className="block mb-2 font-medium text-gray-700">
						Message / Notes
					</label>
					<textarea
						className="w-full border border-gray-300 rounded-lg px-3 py-2"
						rows={3}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Type your message for the user..."
					/>
				</div>

				{/* Prescription */}
				<div>
					<label className="block mb-2 font-medium text-gray-700">
						Prescription
					</label>
					<textarea
						className="w-full border border-gray-300 rounded-lg px-3 py-2"
						rows={3}
						value={prescription}
						onChange={(e) => setPrescription(e.target.value)}
						placeholder="Type prescription details..."
					/>
				</div>

				{/* Follow-Up */}
				<div>
					<label className="block mb-2 font-medium text-gray-700">
						Follow-Up
					</label>
					<input
						type="text"
						className="w-full border border-gray-300 rounded-lg px-3 py-2"
						value={followUp}
						onChange={(e) => setFollowUp(e.target.value)}
						placeholder="Next check-up date or session..."
					/>
				</div>

				<button
					type="submit"
					className="w-full bg-indigo-500 text-white py-2 rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
					disabled={loading}>
					{loading ? "Updating..." : "Send to User"}
				</button>

				{success && <p className="text-green-600 mt-2">{success}</p>}
				{error && <p className="text-red-600 mt-2">{error}</p>}
			</form>
		</div>
	)
}
