import React from "react"
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Services from "./pages/Services"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Appointment from "./pages/Appointment"

import Login from "./pages/Login"
import ResetPassword from "./pages/ResetPassword"
import ProtectedRoute from "./auth/ProtectedRoute"
import UpdatePassword from "./pages/UpdatePassword"
import Dashboard from "./pages/Dashboard"
import AuthLayout from "./pages/authLayout"

import AdminLogin from "./admin/AdminLogin"
import AdminLayout from "./admin/AdminLayout"
import AdminDashboard from "./admin/AdminDashboard"
import Appointments from "./admin/Appointments"
import AppointmentDetail from "./admin/AppointmentDetail"
import Analytics from "./admin/Analytics"
import Diagnostics from "./admin/Diagnostics"

function AppContent() {
	const location = useLocation()
	const isAdminRoute = location.pathname.startsWith("/admin")

	return (
		<div className="min-h-screen bg-gray-50">
			{!isAdminRoute && <Navbar />}

			<main>
				<Routes>
					{/* Public Routes */}
					<Route path="/" element={<Home />} />
					<Route path="/services" element={<Services />} />
					<Route path="/about" element={<About />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/appointment" element={<Appointment />} />

					{/* Auth Routes */}
					<Route
						path="/login"
						element={
							<AuthLayout>
								<Login />
							</AuthLayout>
						}
					/>
					<Route
						path="/reset-password"
						element={
							<AuthLayout>
								<ResetPassword />
							</AuthLayout>
						}
					/>
					<Route
						path="/update-password"
						element={
							<AuthLayout>
								<UpdatePassword />
							</AuthLayout>
						}
					/>
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>

					{/* Admin Routes */}
					<Route
						path="/admin/login"
						element={
							<AdminLayout>
								<AdminLogin />
							</AdminLayout>
						}
					/>
					<Route
						path="/admin/dashboard"
						element={
							<AdminLayout>
								<AdminDashboard />
							</AdminLayout>
						}
					/>
					<Route
						path="/admin/appointments"
						element={
							<AdminLayout>
								<Appointments />
							</AdminLayout>
						}
					/>
					<Route
						path="/admin/appointments/:id"
						element={
							<AdminLayout>
								<AppointmentDetail />
							</AdminLayout>
						}
					/>
					<Route
						path="/admin/analytics"
						element={
							<AdminLayout>
								<Analytics />
							</AdminLayout>
						}
					/>
					<Route
						path="/admin/diagnostics"
						element={
							<AdminLayout>
								<Diagnostics />
							</AdminLayout>
						}
					/>
				</Routes>
			</main>

			{!isAdminRoute && <Footer />}
		</div>
	)
}

function App() {
	return (
		<Router>
			<AppContent />
		</Router>
	)
}

export default App
