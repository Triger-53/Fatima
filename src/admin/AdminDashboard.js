import React from "react"
import { NavLink } from "react-router-dom"
import AdminNav from "./AdminNav"

const AdminDashboard = () => {
	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<AdminNav />
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
			</div>
		</div>
	)
}

export default AdminDashboard
