import React, { useState, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Briefcase, Phone, Calendar, User, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { Transition } from "@headlessui/react";

const NavLink = ({ to, children, isActive, onClick }) => (
	<Link
		to={to}
		onClick={onClick}
		className={`text-sm font-medium transition-colors duration-200 ${isActive
			? "text-primary-600"
			: "text-gray-500 hover:text-primary-600"
			}`}
	>
		{children}
	</Link>
);

const MobileNavLink = ({ to, children, onClick }) => (
	<Link
		to={to}
		onClick={onClick}
		className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600"
	>
		{children}
	</Link>
);

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const location = useLocation();
	const { user, signOut } = useAuth();

	const navItems = [
		{ name: "Home", path: "/" },
		{ name: "Services", path: "/services" },
		{ name: "About", path: "/about" },
		{ name: "Contact", path: "/contact" },
	];

	const isActive = (path) => location.pathname === path;

	const handleLinkClick = () => {
		setIsOpen(false);
	};

	return (
		<nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link to="/" className="flex items-center space-x-3 group transition-transform duration-300 hover:scale-[1.02]">
						<div className="relative">
							<img
								src="/logo.png"
								alt="Dr. Fatima K."
								className="h-11 w-11 object-contain rounded-full shadow-lg shadow-primary-500/20 group-hover:shadow-primary-600/30 transition-shadow duration-300"
							/>
							<div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none"></div>
						</div>
						<div className="flex flex-col">
							<h1 className="text-2xl font-black tracking-tighter leading-none">
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary-700 to-primary-600">
									Fatima
								</span>
								<span className="ml-1 text-primary-600">K.</span>
							</h1>
							<div className="flex items-center space-x-2 mt-1">
								<span className="h-[1px] w-4 bg-primary-300"></span>
								<span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500/80 leading-none">
									Speech & Hearing
								</span>
							</div>
						</div>
					</Link>

					{/* Desktop Nav */}
					<div className="hidden lg:flex items-center space-x-6">
						<div className="flex items-center space-x-6">
							{navItems.map((item) => (
								<NavLink
									key={item.name}
									to={item.path}
									isActive={isActive(item.path)}>
									{item.name}
								</NavLink>
							))}
						</div>
						<Link
							to="/appointment"
							className="btn-primary text-sm flex items-center">
							<Calendar className="w-4 h-4 mr-2" />
							Book Appointment
						</Link>

						<div className="h-6 border-l border-gray-200"></div>

						<div className="flex items-center space-x-4">
							{user ? (
								<>
									<NavLink to="/dashboard" isActive={isActive("/dashboard")}>
										<User className="w-4 h-4 inline-block mr-1" />
										Dashboard
									</NavLink>
									<button
										onClick={signOut}
										className="text-sm font-medium text-gray-500 hover:text-primary-600">
										<LogOut className="w-4 h-4 inline-block mr-1" />
										Logout
									</button>
								</>
							) : (
								<NavLink to="/login" isActive={isActive("/login")}>
									Log in
								</NavLink>
							)}
						</div>
					</div>

					{/* Mobile menu toggle */}
					<div className="lg:hidden flex items-center">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none">
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
			<Transition
				show={isOpen}
				as={Fragment}
				enter="duration-200 ease-out"
				enterFrom="opacity-0 scale-95"
				enterTo="opacity-100 scale-100"
				leave="duration-100 ease-in"
				leaveFrom="opacity-100 scale-100"
				leaveTo="opacity-0 scale-95">
				<div className="lg:hidden absolute top-16 inset-x-0 bg-white shadow-lg z-40">
					<div className="pt-2 pb-3 space-y-1">
						{navItems.map((item) => (
							<MobileNavLink
								key={item.name}
								to={item.path}
								onClick={handleLinkClick}>
								{item.name}
							</MobileNavLink>
						))}
					</div>
					<div className="pt-4 pb-3 border-t border-gray-200">
						<div className="px-4 space-y-2">
							{user ? (
								<>
									<MobileNavLink to="/dashboard" onClick={handleLinkClick}>
										<User className="w-5 h-5 inline-block mr-2" />
										Dashboard
									</MobileNavLink>
									<button
										onClick={() => {
											signOut()
											handleLinkClick()
										}}
										className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50">
										<LogOut className="w-5 h-5 inline-block mr-2" />
										Log out
									</button>
								</>
							) : (
								<MobileNavLink to="/login" onClick={handleLinkClick}>
									Log in
								</MobileNavLink>
							)}
							<Link
								to="/appointment"
								onClick={handleLinkClick}
								className="block w-full text-center btn-primary flex items-center justify-center">
								<Calendar className="w-4 h-4 mr-2" />
								Book Appointment
							</Link>
						</div>
					</div>
				</div>
			</Transition>
		</nav>
	)
};

export default Navbar;