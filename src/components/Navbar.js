import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Phone, Calendar } from "lucide-react"
import { useAuth } from "../auth/AuthProvider"

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false)
	const location = useLocation()
	const { user, signOut } = useAuth()

	const navItems = [
		{ name: "Home", path: "/" },
		{ name: "Services", path: "/services" },
		{ name: "About", path: "/about" },
		{ name: "Contact", path: "/contact" },
	]

	const isActive = (path) =>
		location.pathname === path
			? "text-primary-600 bg-primary-50"
			: "text-gray-700 hover:text-primary-600 hover:bg-gray-50"

	return (
		<nav className="bg-white shadow-lg sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link to="/" className="flex items-center">
						<div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-xl">FK</span>
						</div>
						<div className="ml-3">
							<span className="hidden sm:block text-xl font-semibold text-gray-900">
								Dr. Fatima Kasamnath
							</span>
							<span className="block sm:hidden text-lg font-semibold text-gray-900">
								Dr. Fatima
							</span>
							<span className="block text-sm text-gray-600">
								Speech Therapist
							</span>
						</div>
					</Link>

					{/* Desktop Nav */}
					<div className="hidden md:flex items-center space-x-4 lg:space-x-6">
						{navItems.map((item) => (
							<Link
								key={item.name}
								to={item.path}
								className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(
									item.path
								)}`}>
								{item.name}
							</Link>
						))}
						{user ? (
							<>
								<Link
									to="/dashboard"
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(
										"/dashboard"
									)}`}>
									Dashboard
								</Link>
							</>
						) : (
							<div />
						)}

						{/* CTA */}
						<Link
							to="/contact"
							className="flex items-center text-gray-700 hover:text-primary-600 transition-colors duration-200">
							<Phone className="w-4 h-4 mr-2" />
							<span className="text-sm font-medium">Call Now</span>
						</Link>
						<Link to="/appointment" className="btn-primary flex items-center">
							<Calendar className="w-4 h-4 mr-2" />
							Book Appointment
						</Link>
					</div>

					{user ? (
						<>
							<button
								onClick={signOut}
								className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors duration-200">
								Log out
							</button>
						</>
					) : (
						<>
							<Link
								to="/login"
								className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(
									"/login"
								)}`}>
								Log in
							</Link>
						</>
					)}

					{/* Mobile menu toggle */}
					<div className="md:hidden">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
							{isOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Nav */}
			{isOpen && (
				<div className="md:hidden bg-white border-t border-gray-200 px-2 pt-2 pb-3 space-y-2">
					{navItems.map((item) => (
						<Link
							key={item.name}
							to={item.path}
							onClick={() => setIsOpen(false)}
							className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive(
								item.path
							)}`}>
							{item.name}
							</Link>
						))}

					{user ? (
						<>
							<Link
								to="/dashboard"
								onClick={() => setIsOpen(false)}
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600">
								Dashboard
								</Link>
							<button
								onClick={() => {
									signOut()
									setIsOpen(false)
								}}
								className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600">
								Log out
								</button>
						</>
					) : (
						<>
							<Link
								to="/login"
								onClick={() => setIsOpen(false)}
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600">
								Log in
								</Link>
							<Link
								to="/signup"
								onClick={() => setIsOpen(false)}
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600">
								Sign up
								</Link>
						</>
					)}

					<Link
						to="/contact"
						onClick={() => setIsOpen(false)}
						className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors duration-200">
						<Phone className="w-4 h-4 mr-2" />
						<span>Call Now</span>
					</Link>
					<Link
						to="/appointment"
						onClick={() => setIsOpen(false)}
						className="btn-primary flex items-center justify-center w-full">
							<Calendar className="w-4 h-4 mr-2" />
							Book Appointment
						</Link>
				</div>
			)}
		</nav>
	)
}

export default Navbar
