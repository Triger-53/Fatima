import React, { useEffect, lazy, Suspense } from "react"
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
} from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

const Home = lazy(() => import("./pages/Home"))
const Services = lazy(() => import("./pages/Services"))
const About = lazy(() => import("./pages/About"))
const Contact = lazy(() => import("./pages/Contact"))
const Appointment = lazy(() => import("./pages/Appointment"))
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"))
const TermsOfService = lazy(() => import("./pages/TermsOfService"))

const Login = lazy(() => import("./pages/Login"))
const ResetPassword = lazy(() => import("./pages/ResetPassword"))
const ProtectedRoute = lazy(() => import("./auth/ProtectedRoute"))
const AdminProtectedRoute = lazy(() => import("./auth/AdminProtectedRoute"))
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const SessionDetail = lazy(() => import("./pages/SessionDetail"))
const AuthLayout = lazy(() => import("./pages/authLayout"))

const AdminLogin = lazy(() => import("./admin/AdminLogin"))
const AdminLayout = lazy(() => import("./admin/AdminLayout"))
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"))
const Appointments = lazy(() => import("./admin/Appointments"))
const AppointmentDetail = lazy(() => import("./admin/AppointmentDetail"))
const Analytics = lazy(() => import("./admin/Analytics"))
const Diagnostics = lazy(() => import("./admin/Diagnostics"))
const AdminServices = lazy(() => import("./admin/AdminServices"))
const AppointmentSlotManager = lazy(() => import("./admin/AppointmentSlotManager"))
const AdminSessions = lazy(() => import("./admin/AdminSessions"))

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
				<Suspense fallback={<div>Loading...</div>}>
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
				</Suspense>
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
