import React from "react"
import { Link } from "react-router-dom"
import {
	Phone,
	Mail,
	MapPin,
	Clock,
	Facebook,
	Twitter,
	Instagram,
	Linkedin,
} from "lucide-react"

const Footer = () => {
	return (
		<footer className="bg-gray-900 text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{/* Practice Info */}
					<div>
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-xl">FK</span>
							</div>
							<div className="ml-3">
								<p className="text-xl font-semibold">Dr. Fatima Kasamnath</p>
								<p className="text-sm text-gray-400">Speech Therapist</p>
							</div>
						</div>
						<p className="text-gray-300 mb-4">
							Providing exceptional speech therapy services with compassion and
							expertise. Helping patients of all ages improve their
							communication skills.
						</p>
						<div className="flex space-x-4">
							<a
								href="#"
								className="text-gray-400 hover:text-white transition-colors">
								<Facebook className="w-5 h-5" />
							</a>
							<a
								href="#"
								className="text-gray-400 hover:text-white transition-colors">
								<Twitter className="w-5 h-5" />
							</a>
							<a
								href="#"
								className="text-gray-400 hover:text-white transition-colors">
								<Instagram className="w-5 h-5" />
							</a>
							<a
								href="#"
								className="text-gray-400 hover:text-white transition-colors">
								<Linkedin className="w-5 h-5" />
							</a>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="text-lg font-semibold mb-4">Quick Links</h3>
						<ul className="space-y-2">
							<li>
								<Link
									to="/"
									className="text-gray-300 hover:text-white transition-colors">
									Home
								</Link>
							</li>
							<li>
								<Link
									to="/services"
									className="text-gray-300 hover:text-white transition-colors">
									Services
								</Link>
							</li>
							<li>
								<Link
									to="/about"
									className="text-gray-300 hover:text-white transition-colors">
									About Us
								</Link>
							</li>
							<li>
								<Link
									to="/contact"
									className="text-gray-300 hover:text-white transition-colors">
									Contact
								</Link>
							</li>
							<li>
								<Link
									to="/appointment"
									className="text-gray-300 hover:text-white transition-colors">
									Book Appointment
								</Link>
							</li>
						</ul>
					</div>

					{/* Services */}
					<div>
						<h3 className="text-lg font-semibold mb-4">Services</h3>
						<ul className="space-y-2 text-gray-300">
							<li>Speech & Language Therapy</li>
							<li>Articulation Disorders</li>
							<li>Language Development</li>
							<li>Swallowing Disorders</li>
							<li>Voice Therapy</li>
							<li>Telepractice Available</li>
						</ul>
					</div>

					{/* Contact Info */}
					<div>
						<h3 className="text-lg font-semibold mb-4">Contact Info</h3>
						<div className="space-y-3 text-gray-300">
							<div className="flex items-start">
								<MapPin className="w-5 h-5 text-primary-400 mt-0.5 mr-3 flex-shrink-0" />
								<div>
									<p>123 Medical Center Dr</p>
									<p>Suite 100</p>
									<p>New York, NY 10001</p>
								</div>
							</div>
							<div className="flex items-center">
								<Phone className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0" />
								<span>(555) 123-4567</span>
							</div>
							<div className="flex items-center">
								<Mail className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0" />
								<span>info@drfatimakasamnath.com</span>
							</div>
							<div className="flex items-start">
								<Clock className="w-5 h-5 text-primary-400 mt-0.5 mr-3 flex-shrink-0" />
								<div>
									<p>Mon-Fri: 8:00 AM - 6:00 PM</p>
									<p>Sat: 9:00 AM - 2:00 PM</p>
									<p>Sun: Closed</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-gray-800 mt-8 pt-8">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="text-gray-400 text-sm">
							© 2024 Dr. Fatima Kasamnath Medical Practice. All rights reserved.
						</p>
						<div className="flex space-x-6 mt-4 md:mt-0">
							<Link
								to="/privacy"
								className="text-gray-400 hover:text-white text-sm transition-colors">
								Privacy Policy
							</Link>
							<Link
								to="/terms"
								className="text-gray-400 hover:text-white text-sm transition-colors">
								Terms of Service
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default Footer
