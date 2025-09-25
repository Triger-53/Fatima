import React, { useState, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Briefcase, Phone, Calendar, User, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { Transition } from "@headlessui/react";

const NavLink = ({ to, children, isActive, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`text-sm font-medium transition-colors duration-200 ${
            isActive
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
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">FK</span>
                        </div>
                        <div>
                            <span className="block text-lg font-bold text-gray-900">
                                Dr. Fatima Kasmani
                            </span>
                            <span className="block text-xs text-gray-500">
                                Speech & Hearing Therapist
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-6">
                        <div className="flex items-center space-x-6">
                            {navItems.map((item) => (
                                <NavLink key={item.name} to={item.path} isActive={isActive(item.path)}>
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>

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
                                        className="text-sm font-medium text-gray-500 hover:text-primary-600"
                                    >
                                        <LogOut className="w-4 h-4 inline-block mr-1" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/login" isActive={isActive("/login")}>Log in</NavLink>
                                    <Link to="/appointment" className="btn-primary text-sm flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Book Appointment
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu toggle */}
                    <div className="lg:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                leaveTo="opacity-0 scale-95"
            >
                <div className="lg:hidden absolute top-16 inset-x-0 bg-white shadow-lg z-40">
                    <div className="pt-2 pb-3 space-y-1">
                        {navItems.map((item) => (
                            <MobileNavLink key={item.name} to={item.path} onClick={handleLinkClick}>
                                {item.name}
                            </MobileNavLink>
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {user ? (
                            <div className="px-4 space-y-2">
                                 <MobileNavLink to="/dashboard" onClick={handleLinkClick}>
                                    <User className="w-5 h-5 inline-block mr-2" />
                                    Dashboard
                                </MobileNavLink>
                                <button
                                    onClick={() => {
                                        signOut();
                                        handleLinkClick();
                                    }}
                                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="w-5 h-5 inline-block mr-2" />
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <div className="px-4 space-y-2">
                                <MobileNavLink to="/login" onClick={handleLinkClick}>Log in</MobileNavLink>
                                <Link
                                    to="/appointment"
                                    onClick={handleLinkClick}
                                    className="block w-full text-center btn-primary flex items-center justify-center"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Book Appointment
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </Transition>
        </nav>
    );
};

export default Navbar;