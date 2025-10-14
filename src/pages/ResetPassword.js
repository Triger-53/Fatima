// src/pages/ResetPassword.jsx
import React, { useState } from "react"
import { supabase } from "../supabase"
import { Link } from "react-router-dom"

export default function ResetPassword() {
	const [email, setEmail] = useState("")
	const [message, setMessage] = useState(null)
	const [error, setError] = useState(null)
	const [loading, setLoading] = useState(false)

	const handleReset = async (e) => {
		e.preventDefault()
		setError(null)
		setMessage(null)
		setLoading(true)

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: "http://localhost:3000/update-password",
		})

		setLoading(false)
		if (error) setError(error.message)
		else setMessage("Password reset email sent. Check your inbox.")
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
				<h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
					Reset your password
				</h2>

				<form onSubmit={handleReset} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Email
						</label>
						<input
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							type="email"
							required
							className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
						{loading ? "Sending..." : "Send reset email"}
					</button>
				</form>

				{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
				{message && <p className="mt-4 text-sm text-green-600">{message}</p>}

				<p className="mt-6 text-center text-sm text-gray-700">
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
