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
					<NavLink to="/admin/dashboard" className={linkClasses}>
						Dashboard
					</NavLink>
				</li>
				<li>
					<NavLink to="/admin/appointments" className={linkClasses}>
						Appointments
					</NavLink>
				</li>
				<li>
					<NavLink to="/admin/analytics" className={linkClasses}>
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
