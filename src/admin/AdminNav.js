import React from "react"
import { NavLink, useNavigate } from "react-router-dom"

const AdminNav = () => {
	const navigate = useNavigate()

	const handleLogout = () => {
		localStorage.removeItem("isAdminLoggedIn")
		navigate("/admin/login")
	}

	const linkClasses = ({ isActive }) =>
		isActive
			? "text-blue-600 font-semibold underline"
			: "text-gray-600 font-semibold hover:text-blue-600"

	return (
		<div className="bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
			<h1 className="text-xl font-bold">Admin Panel</h1>
			<ul className="flex space-x-6">
				<li>
					<NavLink
						to="/admin/dashboard"
						className="hover:bg-cyan-100 rounded-3xl p-2">
						Dashboard
					</NavLink>
				</li>
				<li>
					<NavLink
						to="/admin/services"
						className="hover:bg-cyan-100 rounded-3xl p-2">
						Services
					</NavLink>
				</li>
				<li>
					<NavLink
						to="/admin/appointments"
						className="hover:bg-cyan-100 rounded-3xl p-2">
						Appointments
					</NavLink>
				</li>
				<li>
					<NavLink
						to="/admin/Diagnostics"
						className="hover:bg-cyan-100 rounded-3xl p-2">
						Diagnostics
					</NavLink>
				</li>
				<li>
					<NavLink
						to="/admin/analytics"
						className="hover:bg-cyan-100 rounded-3xl p-2">
						Analytics
					</NavLink>
				</li>
			</ul>
			<button
				onClick={handleLogout}
				className="text-red-500 hover:text-red-700 font-semibold">
				Logout
			</button>
		</div>
	)
}

export default AdminNav
