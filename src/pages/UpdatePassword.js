// src/pages/UpdatePassword.jsx
import React, { useState } from "react"
import { supabase } from "../supabase"
import { useNavigate, Link } from "react-router-dom"

export default function UpdatePassword() {
	const [password, setPassword] = useState("")
	const [error, setError] = useState(null)
	const [message, setMessage] = useState(null)
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const handleUpdate = async (e) => {
		e.preventDefault()
		setError(null)
		setMessage(null)
		setLoading(true)

		const { error } = await supabase.auth.updateUser({ password })

		setLoading(false)
		if (error) setError(error.message)
		else {
			setMessage("Password updated. You can log in now.")
			setTimeout(() => navigate("/login"), 1500)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
				<h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
					Set a new password
				</h2>

				<form onSubmit={handleUpdate} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							New password
						</label>
						<input
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							type="password"
							required
							className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
						{loading ? "Saving..." : "Save new password"}
					</button>
				</form>

				{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
				{message && <p className="mt-4 text-sm text-green-600">{message}</p>}

				<p className="mt-6 text-center text-sm text-gray-600">
					Remembered your password?{" "}
					<Link
						to="/login"
						className="text-indigo-600 hover:text-indigo-700 font-medium">
						Log in
					</Link>
				</p>
			</div>
		</div>
	)
}
