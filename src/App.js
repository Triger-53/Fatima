import React, { useEffect } from "react"
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
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"

import Login from "./pages/Login"
import ResetPassword from "./pages/ResetPassword"
import ProtectedRoute from "./auth/ProtectedRoute"
import AdminProtectedRoute from "./auth/AdminProtectedRoute"
import UpdatePassword from "./pages/UpdatePassword"
import Dashboard from "./pages/Dashboard"
import SessionDetail from "./pages/SessionDetail"
import AuthLayout from "./pages/authLayout"

import AdminLogin from "./admin/AdminLogin"
import AdminLayout from "./admin/AdminLayout"
import AdminDashboard from "./admin/AdminDashboard"
import Appointments from "./admin/Appointments"
import AppointmentDetail from "./admin/AppointmentDetail"
import Analytics from "./admin/Analytics"
import Diagnostics from "./admin/Diagnostics"
import AdminServices from "./admin/AdminServices"
import AppointmentSlotManager from "./admin/AppointmentSlotManager"
import AdminSessions from "./admin/AdminSessions"

function AppContent() {
	const location = useLocation()
	const isAdminRoute = location.pathname.startsWith("/admin")

    useEffect(() => {
        // Scroll to top on route change
        window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }, [location.pathname])

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
					<Route path="/privacy" element={<PrivacyPolicy />} />
					<Route path="/terms" element={<TermsOfService />} />

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
					<Route
						path="/session/:id"
						element={
							<ProtectedRoute>
								<SessionDetail />
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
							<AdminProtectedRoute>
								<AdminLayout>
									<AdminDashboard />
								</AdminLayout>
							</AdminProtectedRoute>
						}
					/>
					<Route
						path="/admin/appointments"
						element={
							<AdminProtectedRoute>
								<AdminLayout>
									<Appointments />
								</AdminLayout>
							</AdminProtectedRoute>
						}
					/>
					<Route
						path="/admin/appointments/:id"
						element={
							<AdminProtectedRoute>
								<AdminLayout>
									<AppointmentDetail />
								</AdminLayout>
							</AdminProtectedRoute>
						}
					/>
					<Route
						path="/admin/slot-manager"
						element={
							<AdminProtectedRoute>
								<AdminLayout>
									<AppointmentSlotManager />
								</AdminLayout>
							</AdminProtectedRoute>
						}
					/>
					<Route
						path="/admin/analytics"
						element={
							<AdminProtectedRoute>
								<AdminLayout>
									<Analytics />
								</AdminLayout>
							</AdminProtectedRoute>
						}
					/>
					<Route
						path="/admin/diagnostics"
						element={
							<AdminProtectedRoute>
								<AdminLayout>
									<Diagnostics />
								</AdminLayout>
							</AdminProtectedRoute>
						}
					/>
					<Route
						path="/admin/services"
						element={
							<AdminProtectedRoute>
								<AdminLayout>
									<AdminServices />
								</AdminLayout>
							</AdminProtectedRoute>
						}
					/>
					<Route
						path="/admin/sessions"
						element={
							<AdminProtectedRoute>
								<AdminLayout>
									<AdminSessions />
								</AdminLayout>
							</AdminProtectedRoute>
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
