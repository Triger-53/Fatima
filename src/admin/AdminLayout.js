import React from "react"
import AdminNav from "./AdminNav"
import AdminChatWidget from "./AdminChatWidget"

const AdminLayout = ({ children }) => {
	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<AdminNav />
			<div>{children}</div>
			<AdminChatWidget />
		</div>
	)
}

export default AdminLayout
