import React from "react"

const AuthLayout = ({ children }) => {
	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<div>{children}</div>
		</div>
	)
}

export default AuthLayout
