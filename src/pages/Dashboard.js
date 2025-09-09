// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthProvider"
import { supabase } from "../supabase"

export default function Dashboard() {
	const { user, signOut } = useAuth()
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => { 
		if (!user) return
		setLoading(true)
		supabase
			.from("profiles")
			.select("*")
			.eq("id", user.id)
			.single()
			.then(({ data, error }) => {
				if (error) setError(error.message)
				else setProfile(data)
				setLoading(false)
			})
	}, [user])

	return (
		<div className="max-w-3xl mx-auto px-4 py-10">
			<div className="bg-white shadow rounded-2xl p-6">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
						<p className="text-gray-600">
							Signed in as: <span className="font-medium">{user?.email}</span>
						</p>
					</div>
					<button
						onClick={() => signOut().catch((err) => console.error(err))}
						className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
						Log out
					</button>
				</div>

				{loading && (
					<p className="text-gray-500 animate-pulse">Loading profile...</p>
				)}
				{error && <p className="text-red-600">{error}</p>}

				{profile && (
					<div className="space-y-4">
						<h3 className="text-xl font-semibold text-gray-800">Profile</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-sm text-gray-500">Full name</p>
								<p className="text-gray-900">{profile.full_name}</p>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-sm text-gray-500">Phone</p>
								<p className="text-gray-900">{profile.phone ?? "-"}</p>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg sm:col-span-2">
								<p className="text-sm text-gray-500">Joined</p>
								<p className="text-gray-900">
									{new Date(profile.created_at).toLocaleString()}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
