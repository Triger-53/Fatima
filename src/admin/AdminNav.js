import React, { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"

const AdminNav = () => {
	const navigate = useNavigate()
	const [isOpen, setIsOpen] = useState(false)

	const handleLogout = () => {
		localStorage.removeItem("isAdminLoggedIn")
		navigate("/admin/login")
	}

	const linkClasses = ({ isActive }) =>
		isActive
			? "text-blue-600 font-semibold underline"
			: "text-gray-600 font-semibold hover:text-blue-600"

	return (
		<div className="bg-white shadow-md rounded-lg p-4 mb-6">
			<div className="flex justify-between items-center">
				<h1 className="text-xl font-bold">Admin Panel</h1>
				<div className="hidden md:flex items-center space-x-6">
					<NavLinks />
					<button
						onClick={handleLogout}
						className="text-red-500 hover:text-red-700 font-semibold">
						Logout
					</button>
				</div>
				<div className="md:hidden">
					<button onClick={() => setIsOpen(!isOpen)}>
						{isOpen ? <X /> : <Menu />}
					</button>
				</div>
			</div>
			{isOpen && (
				<div className="mt-4 md:hidden">
					<NavLinks isMobile />
					<button
						onClick={handleLogout}
						className="mt-4 w-full text-left text-red-500 hover:text-red-700 font-semibold">
						Logout
					</button>
				</div>
			)}
		</div>
	)
}

const NavLinks = ({ isMobile }) => (
	<ul
		className={`flex ${
			isMobile ? "flex-col space-y-4" : "space-x-6 items-center"
		}`}>
		<li>
			<NavLink to="/admin/dashboard" className="hover:bg-cyan-100 rounded-3xl p-2">
				Dashboard
			</NavLink>
		</li>
		<li>
			<NavLink to="/admin/services" className="hover:bg-cyan-100 rounded-3xl p-2">
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
				to="/admin/slot-manager"
				className="hover:bg-cyan-100 rounded-3xl p-2">
				Slot Manager
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
			<NavLink to="/admin/analytics" className="hover:bg-cyan-100 rounded-3xl p-2">
				Analytics
			</NavLink>
		</li>
		<li>
			<NavLink to="/admin/sessions" className="hover:bg-cyan-100 rounded-3xl p-2">
				Sessions
			</NavLink>
		</li>
	</ul>
)

export default AdminNav
