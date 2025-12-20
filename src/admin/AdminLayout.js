import React from "react"
import AdminNav from "./AdminNav"

const AdminLayout = ({ children }) => {
	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<AdminNav />
			<div>{children}</div>
		</div>
	)
}

export default AdminLayout
