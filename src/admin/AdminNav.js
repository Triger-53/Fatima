import React from "react"
import { NavLink } from "react-router-dom"

const AdminNav = () => {
	return (
		<div className="bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
			<h1 className="text-xl font-bold">Admin Panel</h1>
			<ul className="flex space-x-6">
				<li>
					<NavLink
						to="/admin/dashboard"
						className="text-primary-600 font-semibold hover:text-primary-800">
						Dashboard
					</NavLink>
				</li>
				<li>
					<NavLink
						to="/admin/appointments"
						className="text-primary-600 font-semibold hover:text-primary-800">
						Appointments
					</NavLink>
				</li>
				<li>
					<NavLink
						to="/admin/analytics"
						className="text-primary-600 font-semibold hover:text-primary-800">
						Analytics
					</NavLink>
				</li>
			</ul>
			<a
				href="#"
				onClick={() => localStorage.removeItem("isAdminLoggedIn")}
				className="text-red-500 hover:text-red-700 font-semibold">
				Logout
			</a>
		</div>
	)
}

export default AdminNav
