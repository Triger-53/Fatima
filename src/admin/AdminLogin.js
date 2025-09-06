import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

const AdminLogin = () => {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const navigate = useNavigate()

	const handleLogin = (e) => {
		e.preventDefault()
		setError("")

		// Hardcoded credentials
		const adminEmail = "fatima"
		const adminPassword = "fk525351"

		if (email === adminEmail && password === adminPassword) {
			// Store login flag in localStorage
			localStorage.setItem("isAdminLoggedIn", "true")
			navigate("/admin/dashboard")
		} else {
			setError("Invalid email or password")
		}
	}

	return (
		<div className="flex items-center justify-center h-screen bg-gray-50">
			<form
				onSubmit={handleLogin}
				className="bg-white p-8 rounded shadow-md w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<input
					type="text"
					placeholder="Email"
					className="w-full mb-4 p-3 border rounded"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					placeholder="Password"
					className="w-full mb-4 p-3 border rounded"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button
					type="submit"
					className="w-full bg-primary-600 text-white py-3 rounded hover:bg-primary-700">
					Login
				</button>
			</form>
		</div>
	)
}

export default AdminLogin
