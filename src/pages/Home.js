import React, { useEffect, useMemo, useState } from 'react';
import CtaIllustration from "../components/CtaIllustration"
import ReviewForm from "../components/ReviewForm";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Quote,
} from 'lucide-react';
import { getAllServicesAsync } from "../data/services";
import { getAllReviewsAsync } from "../data/reviews";

const Home = () => {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let mounted = true;
    const iconMap = {
      Heart: Heart,
      Stethoscope: Stethoscope,
      Shield: Shield,
      Syringe: Shield,
      Activity: Activity,
      Eye: Eye,
    };

    const fetchServices = async () => {
      try {
        const list = await getAllServicesAsync();
        if (!mounted) return;
        const mapped = list.slice(0, 3).map((s) => ({
          icon: React.createElement(iconMap[s.icon] || Heart, {
            className: "w-8 h-8",
          }),
          title: s.title,
          description: s.description,
        }));
        setServices(mapped);
      } catch (_) {
        setServices([]);
      }
    };

    const fetchReviews = async () => {
      try {
        const reviewList = await getAllReviewsAsync();
        if (mounted) {
          setReviews(reviewList);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        setReviews([]);
      }
    };

    fetchServices();
    fetchReviews();

    return () => {
      mounted = false;
    };
  }, []);

  const handleReviewSubmitted = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary-50 to-blue-50 section-padding">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}>
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
								Your Health,{" "}
								<span className="text-primary-600">Our Priority</span>
							</h1>
							<p className="text-xl text-gray-600 mb-8">
								Experience exceptional speech therapy with Dr. Fatima Kasamnath.
								Compassionate, professional, and dedicated to improving
								communication skills for all ages.
							</p>
							<div className="flex flex-col sm:flex-row gap-4">
								<Link
									to="/appointment"
									className="btn-primary flex items-center justify-center">
									<Calendar className="w-5 h-5 mr-2" />
									Book Appointment
								</Link>
								<Link
									to="/contact"
									className="btn-secondary flex items-center justify-center">
									<Phone className="w-5 h-5 mr-2" />
									Call Now
								</Link>
							</div>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="relative">
							<div className="bg-white rounded-2xl shadow-2xl p-8">
								<div className="text-center">
									<div className="w-32 h-32 bg-primary-100 rounded-full mx-auto mb-6 flex items-center justify-center">
										<Users className="w-16 h-16 text-primary-600" />
									</div>
									<h3 className="text-2xl font-semibold text-gray-900 mb-2">
										Dr. Fatima Kasamnath, SLP
									</h3>
									<p className="text-gray-600 mb-4">
										Licensed Speech-Language Pathologist
									</p>
									<div className="space-y-3 text-left">
										<div className="flex items-center">
											<CheckCircle className="w-5 h-5 text-medical-500 mr-3" />
											<span className="text-gray-700">
												25+ Years Experience
											</span>
										</div>
										<div className="flex items-center">
											<CheckCircle className="w-5 h-5 text-medical-500 mr-3" />
											<span className="text-gray-700">
												Same Day Appointments
											</span>
										</div>
										<div className="flex items-center">
											<CheckCircle className="w-5 h-5 text-medical-500 mr-3" />
											<span className="text-gray-700">
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
			<section className="section-padding bg-white">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Our Services
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
								className="card text-center hover:shadow-xl transition-shadow duration-300">
								<div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-6 flex items-center justify-center text-primary-600">
									{service.icon}
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-3">
									{service.title}
								</h3>
								<p className="text-gray-600">{service.description}</p>
							</motion.div>
						))}
					</div>
					<div className="text-center mt-12">
						<Link
							to="/services"
							className="btn-primary inline-flex items-center">
							View All Services
							<ArrowRight className="w-5 h-5 ml-2" />
						</Link>
					</div>
				</div>
			</section>

			{/* Online Section */}
			<section className="bg-gradient-to-br from-primary-50 to-blue-50 section-padding">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}>
							<h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-6">
								Our Online{" "}
								<span className="text-primary-600">
									Consultation & Sessions
								</span>
							</h1>
							<p className="text-xl text-gray-600 mb-8">
								We offer Consultation and interactive speech & Language Therapy
								Sessions online through zoom that are efficient and creative
							</p>
							<div className="flex flex-col sm:flex-row gap-4">
								<Link
									to="/appointment"
									className="btn-primary flex items-center justify-center">
									<Calendar className="w-5 h-5 mr-2" />
									Book Appointment
								</Link>
								<Link
									to="/contact"
									className="btn-secondary flex items-center justify-center">
									<Phone className="w-5 h-5 mr-2" />
									Call Now
								</Link>
							</div>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="relative">
							<div className="bg-white rounded-2xl shadow-2xl p-8">
								<h3 className="text-2xl font-bold text-gray-900 mb-6">
									Our Online Services
								</h3>

								<div className="space-y-4">
									{[
										{
											title: "Speech & Language Therapy",
											desc: "Comprehensive assessment and treatment for speech and language disorders.",
										},
										{
											title: "Articulation Therapy",
											desc: "Specialized treatment for speech sound disorders and pronunciation issues.",
										},
										{
											title: "Adult Communication Therapy",
											desc: "Therapy for adults with communication challenges.",
										},
										{
											title: "Child Language Development",
											desc: "Early intervention for children with language delays.",
										},
									].map((service, idx) => (
										<div
											key={idx}
											className="border-b border-gray-200 pb-3 last:border-0">
											<h4 className="font-medium text-lg text-gray-900">
												{service.title}
											</h4>
											<p className="text-gray-600 text-sm mt-1">
												{service.desc}
											</p>
										</div>
									))}

									<div className="mt-6 p-4 bg-primary-50 rounded-lg">
										<div className="flex items-center justify-center">
											<Link
												to="/appointment"
												className="btn-primary flex items-center justify-center">
												<Calendar className="w-5 h-5 mr-2" />
												Book Appointment
											</Link>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
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

			{/* Review Form */}
			<section className="section-padding bg-gray-50">
				<div className="max-w-7xl mx-auto">
					<ReviewForm onReviewSubmitted={handleReviewSubmitted} />
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
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
						{reviews.map((review, index) => (
							<motion.div
								key={review.id}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								className="card flex flex-col">
								<Quote className="w-8 h-8 text-primary-200 mb-4" />
								<p className="text-gray-600 mb-4 italic flex-grow">
									"{review.review}"
								</p>
								<p className="font-semibold text-gray-900 text-right">
									- A satisfied patient
								</p>
							</motion.div>
						))}
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
	)
};

export default Home;
