import React, { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react"
import { supabase } from "../supabase"

console.log("🔑 Supabase client test:", supabase)

const Appointment = () => {
	const [currentStep, setCurrentStep] = useState(1)
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		dateOfBirth: "",
		gender: "",
		appointmentType: "",
		preferredDate: "",
		preferredTime: "",
		reason: "",
		symptoms: "",
		isNewPatient: "",
		currentMedications: "",
		allergies: "",
		medicalHistory: "",
	})

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [error, setError] = useState(null)

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	const nextStep = () => setCurrentStep((prev) => prev + 1)
	const prevStep = () => setCurrentStep((prev) => prev - 1)

	// --- Razorpay Checkout ---
	const openRazorpay = async () => {
		setIsSubmitting(true)

		const options = {
			key: "rzp_test_REORU4W2JT2Anw",
			amount: 50000, // 500 INR in paise
			currency: "INR",
			name: "Clinic Booking",
			description: "Appointment Payment",
			prefill: {
				name: `${formData.firstName} ${formData.lastName}`,
				email: formData.email,
				contact: formData.phone,
			},
			handler: async function (response) {
				console.log("✅ Payment success:", response)

				// Insert into Supabase
				const { data, error } = await supabase.from("Appointment").insert([
					{
						firstName: formData.firstName,
						lastName: formData.lastName,
						email: formData.email,
						phone: formData.phone,
						dateOfBirth: formData.dateOfBirth,
						gender: formData.gender,
						appointmentType: formData.appointmentType,
						preferredDate: formData.preferredDate,
						preferredTime: formData.preferredTime,
						reason: formData.reason,
						symptoms: formData.symptoms,
						isNewPatient: formData.isNewPatient,
						currentMedications: formData.currentMedications,
						allergies: formData.allergies,
						medicalHistory: formData.medicalHistory,
						paymentId: response.razorpay_payment_id,
					},
				])

				if (error) {
					console.error(
						"❌ Supabase insert error:",
						error.message,
						error.details
					)
					setError(error.message)
				} else {
					console.log("✅ Supabase insert success:", data)
					setIsSubmitted(true)
					setFormData({
						firstName: "",
						lastName: "",
						email: "",
						phone: "",
						dateOfBirth: "",
						gender: "",
						appointmentType: "",
						preferredDate: "",
						preferredTime: "",
						reason: "",
						symptoms: "",
						isNewPatient: "",
						currentMedications: "",
						allergies: "",
						medicalHistory: "",
					})
				}
				setIsSubmitting(false)
			},
			theme: { color: "#3399cc" },
		}

		const rzp = new window.Razorpay(options)
		rzp.on("payment.failed", (err) => {
			console.error("❌ Payment failed:", err.error)
			alert("Payment failed. Please try again.")
			setIsSubmitting(false)
		})
		rzp.open()
	}

	const appointmentTypes = [
		{ value: "speech", label: "Speech & Language Assessment" },
		{ value: "articulation", label: "Articulation Therapy" },
		{ value: "language", label: "Language Development" },
		{ value: "swallowing", label: "Swallowing Evaluation" },
		{ value: "voice", label: "Voice Therapy" },
		{ value: "consultation", label: "Initial Consultation" },
	]

	const timeSlots = [
		"8:00 AM",
		"8:30 AM",
		"9:00 AM",
		"9:30 AM",
		"10:00 AM",
		"10:30 AM",
		"11:00 AM",
		"11:30 AM",
		"2:00 PM",
		"2:30 PM",
		"3:00 PM",
		"3:30 PM",
		"4:00 PM",
		"4:30 PM",
		"5:00 PM",
		"5:30 PM",
	]

	// Step Indicator
	const renderStepIndicator = () => (
		<div className="flex items-center justify-center mb-8">
			{[1, 2, 3, 4].map((step) => (
				<div key={step} className="flex items-center">
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${
							step <= currentStep
								? "bg-primary-600 text-white"
								: "bg-gray-200 text-gray-600"
						}`}>
						{step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
					</div>
					{step < 4 && (
						<div
							className={`w-16 h-1 mx-2 ${
								step < currentStep ? "bg-primary-600" : "bg-gray-200"
							}`}
						/>
					)}
				</div>
			))}
		</div>
	)

	// --- Step 1: Personal Info ---
	const renderPersonalInfo = () => (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className="space-y-6">
			<h3 className="text-2xl font-semibold text-gray-900 mb-6">
				Personal Information
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-gray-700">First Name</label>
					<input
						type="text"
						name="firstName"
						value={formData.firstName}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required
					/>
				</div>
				<div>
					<label className="block text-gray-700">Last Name</label>
					<input
						type="text"
						name="lastName"
						value={formData.lastName}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required
					/>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-gray-700">Email</label>
					<input
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required
					/>
				</div>
				<div>
					<label className="block text-gray-700">Phone</label>
					<input
						type="tel"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required
					/>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-gray-700">Date of Birth</label>
					<input
						type="date"
						name="dateOfBirth"
						value={formData.dateOfBirth}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
					/>
				</div>
				<div>
					<label className="block text-gray-700">Gender</label>
					<select
						name="gender"
						value={formData.gender}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
						<option value="">Select</option>
						<option value="male">Male</option>
						<option value="female">Female</option>
						<option value="other">Other</option>
					</select>
				</div>
			</div>
		</motion.div>
	)

	// --- Step 2: Appointment Details ---
	const renderAppointmentDetails = () => (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className="space-y-6">
			<h3 className="text-2xl font-semibold text-gray-900 mb-6">
				Appointment Details
			</h3>
			<div>
				<label className="block text-gray-700">Type of Appointment</label>
				<select
					name="appointmentType"
					value={formData.appointmentType}
					onChange={handleChange}
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
					required>
					<option value="">Select Appointment Type</option>
					{appointmentTypes.map((type) => (
						<option key={type.value} value={type.value}>
							{type.label}
						</option>
					))}
				</select>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-gray-700">Preferred Date</label>
					<input
						type="date"
						name="preferredDate"
						value={formData.preferredDate}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required
					/>
				</div>
				<div>
					<label className="block text-gray-700">Preferred Time</label>
					<select
						name="preferredTime"
						value={formData.preferredTime}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required>
						<option value="">Select Time</option>
						{timeSlots.map((time) => (
							<option key={time} value={time}>
								{time}
							</option>
						))}
					</select>
				</div>
			</div>
			<div>
				<label className="block text-gray-700">Reason for Visit</label>
				<textarea
					name="reason"
					value={formData.reason}
					onChange={handleChange}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"></textarea>
			</div>
			<div>
				<label className="block text-gray-700">Symptoms</label>
				<textarea
					name="symptoms"
					value={formData.symptoms}
					onChange={handleChange}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"></textarea>
			</div>
		</motion.div>
	)

	// --- Step 3: Medical Info ---
	const renderMedicalInfo = () => (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className="space-y-6">
			<h3 className="text-2xl font-semibold text-gray-900 mb-6">
				Medical History
			</h3>
			<div>
				<label className="block text-gray-700">Are you a new patient?</label>
				<select
					name="isNewPatient"
					value={formData.isNewPatient}
					onChange={handleChange}
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
					<option value="">Select</option>
					<option value="yes">Yes</option>
					<option value="no">No</option>
				</select>
			</div>
			<div>
				<label className="block text-gray-700">Current Medications</label>
				<textarea
					name="currentMedications"
					value={formData.currentMedications}
					onChange={handleChange}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"></textarea>
			</div>
			<div>
				<label className="block text-gray-700">Allergies</label>
				<textarea
					name="allergies"
					value={formData.allergies}
					onChange={handleChange}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"></textarea>
			</div>
			<div>
				<label className="block text-gray-700">Past Medical History</label>
				<textarea
					name="medicalHistory"
					value={formData.medicalHistory}
					onChange={handleChange}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"></textarea>
			</div>
		</motion.div>
	)

	// --- Step 4: Confirmation ---
	const renderConfirmation = () => (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className="space-y-6">
			<h3 className="text-2xl font-semibold text-gray-900 mb-6">
				Confirm Your Appointment
			</h3>
			<div className="bg-white shadow rounded-lg p-6 space-y-4">
				<p>
					<strong>Name:</strong> {formData.firstName} {formData.lastName}
				</p>
				<p>
					<strong>Email:</strong> {formData.email}
				</p>
				<p>
					<strong>Phone:</strong> {formData.phone}
				</p>
				<p>
					<strong>Date of Birth:</strong> {formData.dateOfBirth}
				</p>
				<p>
					<strong>Gender:</strong> {formData.gender}
				</p>
				<p>
					<strong>Appointment Type:</strong> {formData.appointmentType}
				</p>
				<p>
					<strong>Date:</strong> {formData.preferredDate}
				</p>
				<p>
					<strong>Time:</strong> {formData.preferredTime}
				</p>
				<p>
					<strong>Reason:</strong> {formData.reason}
				</p>
				<p>
					<strong>Symptoms:</strong> {formData.symptoms}
				</p>
				<p>
					<strong>New Patient:</strong> {formData.isNewPatient}
				</p>
				<p>
					<strong>Medications:</strong> {formData.currentMedications}
				</p>
				<p>
					<strong>Allergies:</strong> {formData.allergies}
				</p>
				<p>
					<strong>Medical History:</strong> {formData.medicalHistory}
				</p>
			</div>
		</motion.div>
	)

	return (
		<div className="min-h-screen bg-gray-50">
			<section className="bg-gradient-to-br from-primary-50 to-blue-50 section-padding">
				<div className="max-w-7xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}>
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Book Your Appointment
						</h1>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Schedule your visit with Dr. Fatima Kasamnath. Our online booking
							system makes it easy to find a time that works for you.
						</p>
					</motion.div>
				</div>
			</section>

			<section className="section-padding">
				<div className="max-w-4xl mx-auto">
					<div className="card">
						{renderStepIndicator()}

						{isSubmitted ? (
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								className="text-center py-12">
								<CheckCircle className="w-20 h-20 text-medical-500 mx-auto mb-6" />
								<h2 className="text-3xl font-bold text-gray-900 mb-4">
									Appointment Confirmed!
								</h2>
								<p className="text-xl text-gray-600 mb-8">
									Thank you for booking your appointment. We’ve sent a
									confirmation email with all the details.
								</p>
							</motion.div>
						) : (
							<>
								{currentStep === 1 && renderPersonalInfo()}
								{currentStep === 2 && renderAppointmentDetails()}
								{currentStep === 3 && renderMedicalInfo()}
								{currentStep === 4 && renderConfirmation()}

								<div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
									{currentStep > 1 && (
										<button
											type="button"
											onClick={prevStep}
											className="btn-secondary flex items-center">
											<ChevronLeft className="w-5 h-5 mr-2" /> Previous
										</button>
									)}
									{currentStep < 4 ? (
										<button
											type="button"
											onClick={nextStep}
											className="btn-primary flex items-center ml-auto">
											Next <ChevronRight className="w-5 h-5 ml-2" />
										</button>
									) : (
										<button
											type="button"
											disabled={isSubmitting}
											onClick={openRazorpay}
											className="btn-primary flex items-center ml-auto disabled:opacity-50">
											{isSubmitting ? (
												"Processing..."
											) : (
												<>
													<Calendar className="w-5 h-5 mr-2" /> Pay & Confirm
												</>
											)}
										</button>
									)}
								</div>
							</>
						)}
					</div>
				</div>
			</section>
		</div>
	)
}

export default Appointment
