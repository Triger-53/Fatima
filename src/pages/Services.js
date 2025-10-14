import React, { useState, useEffect } from "react"
import SEO from "../components/SEO"
import CtaIllustration from "../components/CtaIllustration"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
	Heart,
	Stethoscope,
	Shield,
	Syringe,
	Activity,
	Eye,
	Baby,
	Brain,
	Star,
	Calendar,
	Clock,
	CheckCircle,
} from "lucide-react"
import { getAllServicesAsync } from "../data/services"

const Services = () => {
	const [services, setServices] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		// Load services and map icons
		const iconMap = {
			Heart: Heart,
			Stethoscope: Stethoscope,
			Shield: Shield,
			Syringe: Syringe,
			Activity: Activity,
			Eye: Eye,
		}

		;(async () => {
			try {
				const list = await getAllServicesAsync()
				const mappedServices = list.map((service) => ({
					...service,
					icon: React.createElement(iconMap[service.icon], {
						className: "w-8 h-8",
					}),
				}))
				setServices(mappedServices)
			} catch (err) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		})()
	}, [])

	// helper to format prices
	const formatPrice = (price) => {
		if (!price) return ""
		// Handle both old format (price object) and new format (single number)
		if (typeof price === "number") {
			return `₹${price.toLocaleString()}`
		}
		// Use INR pricing for display
		const inrPrice = price.inr || price
		return inrPrice.min === inrPrice.max
			? `₹${inrPrice.min.toLocaleString()}`
			: `₹${inrPrice.min.toLocaleString()} - ₹${inrPrice.max.toLocaleString()}`
	}

	if (loading) {
		return (
			<>
				<SEO
					title="Services - Dr. Fatima Kasamnath"
					description="Explore the comprehensive speech therapy services offered by Dr. Fatima Kasamnath. We provide personalized therapy for children, teens, adults, and seniors."
				/>
				<div className="min-h-screen bg-gray-50 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
						<p className="text-gray-700">Loading services...</p>
					</div>
				</div>
			</>
		)
	}

	if (error) {
		return (
			<>
				<SEO
					title="Services - Dr. Fatima Kasamnath"
					description="Explore the comprehensive speech therapy services offered by Dr. Fatima Kasamnath. We provide personalized therapy for children, teens, adults, and seniors."
				/>
				<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
					<div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl">
						<h1 className="text-2xl font-bold text-red-800 mb-4">Configuration Error</h1>
						<p className="text-red-700 mb-4">
							Could not load services. The following error occurred:
						</p>
						<pre className="bg-red-100 text-red-900 p-4 rounded-md text-left whitespace-pre-wrap">
							<code>{error}</code>
						</pre>
						<p className="text-gray-700 mt-6">
							This usually means you need to set your Supabase environment variables (REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY) in your hosting provider (e.g., Vercel).
						</p>
					</div>
				</div>
			</>
		)
	}

	return (
		<>
			<SEO
				title="Services - Dr. Fatima Kasamnath"
				description="Explore the comprehensive speech therapy services offered by Dr. Fatima Kasamnath. We provide personalized therapy for children, teens, adults, and seniors."
			/>
			<div className="min-h-screen bg-gray-50">
				{/* Hero Section */}
				<section className="bg-gradient-to-br from-primary-50 to-blue-50 section-padding">
				<div className="max-w-7xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}>
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Our Services
						</h1>
						<p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
							Comprehensive speech therapy services designed to meet your
							communication needs at every age. From children to seniors, we're
							here to support your speech and language development.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								to="/appointment"
								className="btn-primary flex items-center justify-center">
								<Calendar className="w-5 h-5 mr-2" />
								Book Appointment
							</Link>
							<Link
								to="/contact"
								className="btn-secondary flex items-center justify-center">
								<Clock className="w-5 h-5 mr-2" />
								Check Availability
							</Link>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Services Grid */}
			<section className="section-padding">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{services.map((service, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 50 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
								<div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-6">
									{service.icon}
								</div>
								<h3 className="text-2xl font-semibold text-gray-900 mb-3">
									{service.title}
								</h3>
								<p className="text-gray-700 mb-6">{service.description}</p>

								<div className="space-y-4 mb-6">
									<h4 className="font-semibold text-gray-900">
										What's Included:
									</h4>
									<ul className="space-y-2">
										{service.features.map((feature, featureIndex) => (
											<li key={featureIndex} className="flex items-start">
												<CheckCircle className="w-5 h-5 text-medical-500 mr-3 mt-0.5 flex-shrink-0" />
												<span className="text-gray-700">{feature}</span>
											</li>
										))}
									</ul>
								</div>

								<div className="border-t border-gray-200 pt-4">
									<div className="flex justify-between items-center mb-4">
										<div className="flex items-center text-blue-600">
											<Clock className="w-4 h-4 mr-2" />
											<span className="text-sm font-semibold">
												{service.duration}
											</span>
										</div>
										<div className="flex items-center text-gray-700">
											<span className="text-sm font-medium">
												{formatPrice(service.price)}
											</span>
										</div>
									</div>
									<Link
										to={`/appointment?service=${encodeURIComponent(
											JSON.stringify({
												id: service.id,
												title: service.title,
												price: service.price,
												appointmentType: service.appointmentType,
											})
										)}`}
										className="btn-primary w-full flex items-center justify-center">
										<Calendar className="w-4 h-4 mr-2" />
										Book This Service
									</Link>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>
			{/* Payment */}
			<section className="section-padding bg-white">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}>
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
								Payment Options
							</h2>
							<p className="text-lg text-gray-700 mb-8">
								We offer flexible payment options to ensure quality healthcare
								is accessible to everyone.
							</p>
							<div className="space-y-4">
								<div className="flex items-center">
									<CheckCircle className="w-6 h-6 text-medical-500 mr-3" />
									<span className="text-gray-700">
										Flexible payment plans available
									</span>
								</div>
								<div className="flex items-center">
									<CheckCircle className="w-6 h-6 text-medical-500 mr-3" />
									<span className="text-gray-700">
										Transparent pricing with no hidden fees
									</span>
								</div>
								<div className="flex items-center">
									<CheckCircle className="w-6 h-6 text-medical-500 mr-3" />
									<span className="text-gray-700">Self-pay and discounts</span>
								</div>
							</div>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="bg-white rounded-2xl shadow-xl p-8">
							<h3 className="text-2xl font-semibold text-gray-900 mb-6">
								Why Choose Us?
							</h3>
							<div className="space-y-4">
								<div className="flex items-center">
									<Star className="w-5 h-5 text-yellow-400 fill-current mr-3" />
									<span className="text-gray-700">
										Licensed speech-language pathologist
									</span>
								</div>
								<div className="flex items-center">
									<Star className="w-5 h-5 text-yellow-400 fill-current mr-3" />
									<span className="text-gray-700">
										Flexible appointment scheduling
									</span>
								</div>
								<div className="flex items-center">
									<Star className="w-5 h-5 text-yellow-400 fill-current mr-3" />
									<span className="text-gray-700">
										Child-friendly therapy environment
									</span>
								</div>
								<div className="flex items-center">
									<Star className="w-5 h-5 text-yellow-400 fill-current mr-3" />
									<span className="text-gray-700">
										Therapy for all age groups
									</span>
								</div>
								<div className="flex items-center">
									<Star className="w-5 h-5 text-yellow-400 fill-current mr-3" />
									<span className="text-gray-700">Telepractice available</span>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="section-padding bg-primary-600 relative overflow-hidden">
				<CtaIllustration />
				<div className="max-w-4xl mx-auto text-center relative z-10">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
						Ready to Schedule Your Therapy Session?
					</h2>
					<p className="text-xl text-primary-100 mb-8">
						Book your appointment online or call us to discuss your speech
						therapy needs.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							to="/appointment"
							className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center">
							<Calendar className="w-5 h-5 mr-2" />
							Book Online
						</Link>
						<Link
							to="/contact"
							className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center">
							<Clock className="w-5 h-5 mr-2" />
							Call to Schedule
						</Link>
					</div>
				</div>
			</section>
		</div>
		</>
	)
}

export default Services
