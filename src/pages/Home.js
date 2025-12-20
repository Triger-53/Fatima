import React, { useEffect, useState } from "react"
import SEO from "../components/SEO"
import CtaIllustration from "../components/CtaIllustration"
import ReviewModal from "../components/ReviewModal"
import FloatingReviewButton from "../components/FloatingReviewButton"
import MultiReviewSlider from "../components/MultiReviewSlider"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
	Calendar,
	Phone,
	MapPin,
	Clock,
	Heart,
	Stethoscope,
	Shield,
	Users,
	Activity,
	Eye,
	Star,
	ArrowRight,
	CheckCircle,
} from "lucide-react"
import { getAllServicesAsync } from "../data/services"
import { getAllReviewsAsync } from "../data/reviews"

const Home = () => {
	const [services, setServices] = useState([])
	const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
	const [reviews, setReviews] = useState([])

	useEffect(() => {
		let mounted = true
		const iconMap = {
			Heart: Heart,
			Stethoscope: Stethoscope,
			Shield: Shield,
			Syringe: Shield,
			Activity: Activity,
			Eye: Eye,
		}

		const fetchServices = async () => {
			try {
				const list = await getAllServicesAsync()
				if (!mounted) return
				const mapped = list.slice(0, 3).map((s) => ({
					icon: React.createElement(iconMap[s.icon] || Heart, {
						className: "w-8 h-8",
					}),
					title: s.title,
					description: s.description,
				}))
				setServices(mapped)
			} catch (_) {
				setServices([])
			}
		}

		const fetchReviews = async () => {
			try {
				const reviewList = await getAllReviewsAsync()
				if (mounted) {
					const reviewsWithRating = reviewList.map((r) => ({
						...r,
						rating: 5,
					}))
					setReviews(reviewsWithRating)
				}
			} catch (error) {
				console.error("Failed to fetch reviews:", error)
				setReviews([])
			}
		}

		fetchServices()
		fetchReviews()

		return () => {
			mounted = false
		}
	}, [])

	const handleOpenReviewModal = () => {
		setIsReviewModalOpen(true)
	}

	const handleCloseReviewModal = () => {
		setIsReviewModalOpen(false)
	}

	const handleReviewSubmitted = (newReview) => {
		const reviewWithRating = { ...newReview, rating: 5 }
		setReviews((prevReviews) => [reviewWithRating, ...prevReviews])
	}


	return (
		<>
			<SEO
				title="Dr. Fatima Kasamnath - Speech-Language Pathologist"
				description="Compassionate and professional speech therapy services for all ages. Dr. Fatima Kasamnath is a licensed Speech-Language Pathologist with over 25 years of experience."
			/>
			<div className="min-h-screen">
				<FloatingReviewButton onClick={handleOpenReviewModal} />
				<ReviewModal
					isOpen={isReviewModalOpen}
					onClose={handleCloseReviewModal}
					onReviewSubmitted={handleReviewSubmitted}
				/>

				{/* Hero Section */}
				<section className="relative bg-gradient-to-br from-primary-50 via-blue-50 to-white section-padding overflow-hidden">
					{/* Decorative background elements echoing logo */}
					<div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl"></div>
					<div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>

					<div className="max-w-7xl mx-auto relative z-10">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
							<motion.div
								initial={{ opacity: 0, x: -50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8 }}>
								{/* Logo icon accent */}
								<div className="flex items-center space-x-3 mb-6">
									<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-3 shadow-lg shadow-primary-500/30">
										<img src="/logo.png" alt="" className="w-full h-full object-contain filter brightness-0 invert" />
									</div>
									<div className="h-1 w-20 bg-gradient-to-r from-primary-600 to-transparent rounded-full"></div>
								</div>

								<h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
									Your Health,{" "}
									<span className="gradient-text block">Our Priority</span>
								</h1>
								<p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
									Experience exceptional <span className="font-semibold text-primary-700">speech & hearing therapy</span> with Dr. Fatima Kassamanath.
									Compassionate, professional, and dedicated to improving
									communication skills for all ages.
								</p>
								<div className="flex flex-col sm:flex-row gap-4">
									<Link
										to="/appointment"
										className="btn-primary flex items-center justify-center group">
										<Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
										Book Appointment
									</Link>
									<Link
										to="/contact"
										className="btn-secondary flex items-center justify-center group">
										<Phone className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
										Call Now
									</Link>
								</div>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="relative">
								<div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-premium-lg p-10 border border-white/60">
									{/* Decorative corner element */}
									<div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl opacity-10 blur-xl"></div>

									<div className="text-center">
										<div className="relative inline-block mb-8">
											<div className="w-32 h-32 logo-circle mx-auto flex items-center justify-center">
												<Users className="w-16 h-16 text-primary-600" />
											</div>
											<div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
												<CheckCircle className="w-6 h-6 text-white" />
											</div>
										</div>
										<h3 className="text-3xl font-black text-gray-900 mb-3">
											Dr. Fatima Kassamanath
										</h3>
										<p className="text-lg text-primary-600 font-semibold mb-6">
											Licensed Speech-Language Pathologist
										</p>
										<div className="space-y-4 text-left">
											<div className="flex items-center group">
												<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-100 to-medical-50 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
													<CheckCircle className="w-5 h-5 text-medical-600" />
												</div>
												<span className="text-gray-700 font-medium">
													25+ Years Experience
												</span>
											</div>
											<div className="flex items-center group">
												<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-100 to-medical-50 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
													<CheckCircle className="w-5 h-5 text-medical-600" />
												</div>
												<span className="text-gray-700 font-medium">
													Same Day Appointments
												</span>
											</div>
											<div className="flex items-center group">
												<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-100 to-medical-50 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
													<CheckCircle className="w-5 h-5 text-medical-600" />
												</div>
												<span className="text-gray-700 font-medium">
													Telemedicine Available
												</span>
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Services Overview */}
				<section className="section-padding bg-white relative overflow-hidden">
					{/* Subtle decorative elements */}
					<div className="absolute top-0 left-0 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
					<div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

					<div className="max-w-7xl mx-auto relative z-10">
						<div className="text-center mb-16">
							<h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
								Our <span className="gradient-text">Services</span>
							</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								Comprehensive speech therapy services designed to meet your
								communication needs at every age.
							</p>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
							{services.map((service, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: index * 0.1 }}
									className="card text-center group">
									<div className="icon-container mx-auto mb-6">
										{service.icon}
									</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
										{service.title}
									</h3>
									<p className="text-gray-600 leading-relaxed">{service.description}</p>
								</motion.div>
							))}
						</div>
						<div className="text-center mt-12">
							<Link
								to="/services"
								className="btn-primary inline-flex items-center group">
								View All Services
								<ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
							</Link>
						</div>
					</div>
				</section>

				{/* Why Choose Us */}
				<section className="section-padding bg-gray-50">
					<div className="max-w-7xl mx-auto">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
							<div>
								<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
									Why Choose Dr. Fatima Kasamnath?
								</h2>
								<div className="space-y-6">
									<div className="flex items-start">
										<div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
											<Heart className="w-6 h-6 text-medical-600" />
										</div>
										<div>
											<h3 className="text-xl font-semibold text-gray-900 mb-2">
												All Ages Welcome
											</h3>
											<p className="text-gray-600">
												Specialized therapy for children, teens, adults, and
												seniors.
											</p>
										</div>
									</div>
									<div className="flex items-start">
										<div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
											<Clock className="w-6 h-6 text-medical-600" />
										</div>
										<div>
											<h3 className="text-xl font-semibold text-gray-900 mb-2">
												Flexible Scheduling
											</h3>
											<p className="text-gray-600">
												Convenient appointment times including evenings and
												weekends.
											</p>
										</div>
									</div>
									<div className="flex items-start">
										<div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
											<Shield className="w-6 h-6 text-medical-600" />
										</div>
										<div>
											<h3 className="text-xl font-semibold text-gray-900 mb-2">
												Evidence-Based Therapy
											</h3>
											<p className="text-gray-600">
												Latest research-based techniques and proven treatment
												methods.
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-white rounded-2xl shadow-xl p-8">
								<h3 className="text-2xl font-semibold text-gray-900 mb-6">
									Office Hours
								</h3>
								<div className="space-y-4">
									<div className="flex justify-between items-center py-3 border-b border-gray-200">
										<span className="font-medium">Monday - Friday</span>
										<span className="text-gray-600">8:00 AM - 6:00 PM</span>
									</div>
									<div className="flex justify-between items-center py-3 border-b border-gray-200">
										<span className="font-medium">Saturday</span>
										<span className="text-gray-600">9:00 AM - 2:00 PM</span>
									</div>
									<div className="flex justify-between items-center py-3">
										<span className="font-medium">Sunday</span>
										<span className="text-gray-600">Closed</span>
									</div>
								</div>
								<div className="mt-6 p-4 bg-primary-50 rounded-lg">
									<div className="flex items-center">
										<Phone className="w-5 h-5 text-primary-600 mr-3" />
										<div>
											<p className="font-medium text-gray-900">Emergency?</p>
											<p className="text-sm text-gray-600">Call (555) 123-4567</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Testimonials */}
				<section className="section-padding bg-white">
					<div className="max-w-7xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								What Our Patients Say
							</h2>
							<p className="text-xl text-gray-600">
								Don't just take our word for it - hear from our satisfied
								patients.
							</p>
						</div>
						<div className="mt-12">
							<MultiReviewSlider reviews={reviews} />
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="section-padding bg-primary-600 relative overflow-hidden">
					<CtaIllustration />
					<div className="max-w-4xl mx-auto text-center relative z-10">
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
							Ready to Improve Your Communication?
						</h2>
						<p className="text-xl text-primary-100 mb-8">
							Book your appointment today and start your journey to better speech
							and language skills.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								to="/appointment"
								className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center">
								<Calendar className="w-5 h-5 mr-2" />
								Book Appointment
							</Link>
							<Link
								to="/contact"
								className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center">
								<Phone className="w-5 h-5 mr-2" />
								Call Us
							</Link>
						</div>
					</div>
				</section>
			</div>
		</>
	)
};

export default Home;
