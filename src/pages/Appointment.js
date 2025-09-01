// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   Calendar, 
//   Clock, 
//   User, 
//   Phone, 
//   Mail, 
//   MessageSquare,
//   CheckCircle,
//   AlertCircle,
//   ChevronRight,
//   ChevronLeft
// } from 'lucide-react';

// const Appointment = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     // Personal Information
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     dateOfBirth: '',
//     gender: '',
    
//     // Appointment Details
//     appointmentType: '',
//     preferredDate: '',
//     preferredTime: '',
//     reason: '',
//     symptoms: '',
    
//     // Medical History
//     isNewPatient: '',
//     currentMedications: '',
//     allergies: '',
//     medicalHistory: ''
//   });

//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const nextStep = () => {
//     setCurrentStep(currentStep + 1);
//   };

//   const prevStep = () => {
//     setCurrentStep(currentStep - 1);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     // Simulate form submission
//     setTimeout(() => {
//       setIsSubmitted(true);
//       setIsSubmitting(false);
//     }, 3000);
//   };

//   const appointmentTypes = [
//     { value: 'speech', label: 'Speech & Language Assessment' },
//     { value: 'articulation', label: 'Articulation Therapy' },
//     { value: 'language', label: 'Language Development' },
//     { value: 'swallowing', label: 'Swallowing Evaluation' },
//     { value: 'voice', label: 'Voice Therapy' },
//     { value: 'consultation', label: 'Initial Consultation' }
//   ];

//   const timeSlots = [
//     '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
//     '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
//     '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
//   ];

//   const renderStepIndicator = () => (
//     <div className="flex items-center justify-center mb-8">
//       {[1, 2, 3, 4].map((step) => (
//         <div key={step} className="flex items-center">
//           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
//             step <= currentStep 
//               ? 'bg-primary-600 text-white' 
//               : 'bg-gray-200 text-gray-600'
//           }`}>
//             {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
//           </div>
//           {step < 4 && (
//             <div className={`w-16 h-1 mx-2 ${
//               step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
//             }`} />
//           )}
//         </div>
//       ))}
//     </div>
//   );

//   const renderPersonalInfo = () => (
//     <motion.div
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.5 }}
//       className="space-y-6"
//     >
//       <h3 className="text-2xl font-semibold text-gray-900 mb-6">
//         Personal Information
//       </h3>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
//             First Name *
//           </label>
//           <input
//             type="text"
//             id="firstName"
//             name="firstName"
//             value={formData.firstName}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//             placeholder="Your first name"
//           />
//         </div>
//         <div>
//           <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
//             Last Name *
//           </label>
//           <input
//             type="text"
//             id="lastName"
//             name="lastName"
//             value={formData.lastName}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//             placeholder="Your last name"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//             Email Address *
//           </label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//             placeholder="your.email@example.com"
//           />
//         </div>
//         <div>
//           <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
//             Phone Number *
//           </label>
//           <input
//             type="tel"
//             id="phone"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//             placeholder="(555) 123-4567"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
//             Date of Birth *
//           </label>
//           <input
//             type="date"
//             id="dateOfBirth"
//             name="dateOfBirth"
//             value={formData.dateOfBirth}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//           />
//         </div>
//         <div>
//           <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
//             Gender *
//           </label>
//           <select
//             id="gender"
//             name="gender"
//             value={formData.gender}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//           >
//             <option value="">Select gender</option>
//             <option value="male">Male</option>
//             <option value="female">Female</option>
//             <option value="other">Other</option>
//             <option value="prefer-not-to-say">Prefer not to say</option>
//           </select>
//         </div>
//       </div>
//     </motion.div>
//   );

//   const renderAppointmentDetails = () => (
//     <motion.div
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.5 }}
//       className="space-y-6"
//     >
//       <h3 className="text-2xl font-semibold text-gray-900 mb-6">
//         Appointment Details
//       </h3>
      
//       <div>
//         <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-2">
//           Appointment Type *
//         </label>
//         <select
//           id="appointmentType"
//           name="appointmentType"
//           value={formData.appointmentType}
//           onChange={handleChange}
//           required
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//         >
//           <option value="">Select appointment type</option>
//           {appointmentTypes.map((type) => (
//             <option key={type.value} value={type.value}>
//               {type.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
//             Preferred Date *
//           </label>
//           <input
//             type="date"
//             id="preferredDate"
//             name="preferredDate"
//             value={formData.preferredDate}
//             onChange={handleChange}
//             required
//             min={new Date().toISOString().split('T')[0]}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//           />
//         </div>
//         <div>
//           <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
//             Preferred Time *
//           </label>
//           <select
//             id="preferredTime"
//             name="preferredTime"
//             value={formData.preferredTime}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//           >
//             <option value="">Select time</option>
//             {timeSlots.map((time) => (
//               <option key={time} value={time}>
//                 {time}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div>
//         <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
//           Reason for Therapy Session *
//         </label>
//         <textarea
//           id="reason"
//           name="reason"
//           value={formData.reason}
//           onChange={handleChange}
//           required
//           rows={3}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//           placeholder="Please describe the reason for your therapy session..."
//         />
//       </div>

//       <div>
//         <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
//           Communication Challenges (if applicable)
//         </label>
//         <textarea
//           id="symptoms"
//           name="symptoms"
//           value={formData.symptoms}
//           onChange={handleChange}
//           rows={3}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//           placeholder="Please describe any communication challenges you're experiencing..."
//         />
//       </div>
//     </motion.div>
//   );

//   const renderInsuranceInfo = () => (
//     <motion.div
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.5 }}
//       className="space-y-6"
//     >
//       <div>
//         <label htmlFor="isNewPatient" className="block text-sm font-medium text-gray-700 mb-2">
//           Are you a new patient? *
//         </label>
//         <select
//           id="isNewPatient"
//           name="isNewPatient"
//           value={formData.isNewPatient}
//           onChange={handleChange}
//           required
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//         >
//           <option value="">Select option</option>
//           <option value="yes">Yes, I'm a new patient</option>
//           <option value="no">No, I'm an existing patient</option>
//         </select>
//       </div>

//       <div>
//         <label htmlFor="currentMedications" className="block text-sm font-medium text-gray-700 mb-2">
//           Current Medications (if any)
//         </label>
//         <textarea
//           id="currentMedications"
//           name="currentMedications"
//           value={formData.currentMedications}
//           onChange={handleChange}
//           rows={3}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//           placeholder="List any medications you're currently taking..."
//         />
//       </div>

//       <div>
//         <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
//           Allergies
//         </label>
//         <textarea
//           id="allergies"
//           name="allergies"
//           value={formData.allergies}
//           onChange={handleChange}
//           rows={3}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//           placeholder="List any allergies you have..."
//         />
//       </div>

//       <div>
//         <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-2">
//           Relevant Medical History
//         </label>
//         <textarea
//           id="medicalHistory"
//           name="medicalHistory"
//           value={formData.medicalHistory}
//           onChange={handleChange}
//           rows={4}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//           placeholder="Please provide any relevant medical history that may affect speech therapy..."
//         />
//       </div>
//     </motion.div>
//   );

//   const renderConfirmation = () => (
//     <motion.div
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.5 }}
//       className="space-y-6"
//     >
//       <h3 className="text-2xl font-semibold text-gray-900 mb-6">
//         Confirm Your Appointment
//       </h3>
      
//       <div className="bg-gray-50 rounded-lg p-6 space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
//             <p className="text-gray-600">{formData.firstName} {formData.lastName}</p>
//             <p className="text-gray-600">{formData.email}</p>
//             <p className="text-gray-600">{formData.phone}</p>
//           </div>
//           <div>
//             <h4 className="font-semibold text-gray-900 mb-2">Appointment Details</h4>
//             <p className="text-gray-600">{formData.appointmentType}</p>
//             <p className="text-gray-600">{formData.preferredDate} at {formData.preferredTime}</p>
//           </div>
//         </div>
        
//         <div>
//           <h4 className="font-semibold text-gray-900 mb-2">Reason for Visit</h4>
//           <p className="text-gray-600">{formData.reason}</p>
//         </div>
//       </div>

//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex items-start">
//           <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
//           <div>
//             <h4 className="font-semibold text-blue-900 mb-1">Important Notes</h4>
//             <ul className="text-blue-700 text-sm space-y-1">
//               <li>• Please arrive 15 minutes before your appointment time</li>
//               <li>• Complete any required forms before your visit</li>
//               <li>• Call us if you need to reschedule or cancel</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero Section */}
//       <section className="bg-gradient-to-br from-primary-50 to-blue-50 section-padding">
//         <div className="max-w-7xl mx-auto text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//           >
//             <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
//               Book Your Appointment
//             </h1>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Schedule your visit with Dr. Fatima Kasamnath. Our online booking system 
//               makes it easy to find a time that works for you.
//             </p>
//           </motion.div>
//         </div>
//       </section>

//       {/* Appointment Form */}
//       <section className="section-padding">
//         <div className="max-w-4xl mx-auto">
//           <div className="card">
//             {renderStepIndicator()}
            
//             {isSubmitted ? (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="text-center py-12"
//               >
//                 <CheckCircle className="w-20 h-20 text-medical-500 mx-auto mb-6" />
//                 <h2 className="text-3xl font-bold text-gray-900 mb-4">
//                   Appointment Confirmed!
//                 </h2>
//                 <p className="text-xl text-gray-600 mb-8">
//                   Thank you for booking your appointment. We've sent a confirmation 
//                   email with all the details. We look forward to seeing you!
//                 </p>
//                 <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
//                   <h3 className="font-semibold text-gray-900 mb-2">Appointment Details</h3>
//                   <p className="text-gray-600">{formData.preferredDate} at {formData.preferredTime}</p>
//                   <p className="text-gray-600">Dr. Fatima Kasamnath</p>
//                 </div>
//               </motion.div>
//             ) : (
//               <form onSubmit={handleSubmit}>
//                 {currentStep === 1 && renderPersonalInfo()}
//                 {currentStep === 2 && renderAppointmentDetails()}
//                 {currentStep === 3 && renderInsuranceInfo()}
//                 {currentStep === 4 && renderConfirmation()}

//                 <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
//                   {currentStep > 1 && (
//                     <button
//                       type="button"
//                       onClick={prevStep}
//                       className="btn-secondary flex items-center"
//                     >
//                       <ChevronLeft className="w-5 h-5 mr-2" />
//                       Previous
//                     </button>
//                   )}
                  
//                   {currentStep < 4 ? (
//                     <button
//                       type="button"
//                       onClick={nextStep}
//                       className="btn-primary flex items-center ml-auto"
//                     >
//                       Next
//                       <ChevronRight className="w-5 h-5 ml-2" />
//                     </button>
//                   ) : (
//                     <button
//                       type="submit"
//                       disabled={isSubmitting}
//                       className="btn-primary flex items-center ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {isSubmitting ? (
//                         <>
//                           <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                           Confirming...
//                         </>
//                       ) : (
//                         <>
//                           <Calendar className="w-5 h-5 mr-2" />
//                           Confirm Appointment
//                         </>
//                       )}
//                     </button>
//                   )}
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Appointment;





















import React, { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

const Appointment = () => {
	const [currentStep, setCurrentStep] = useState(1)
	const [formData, setFormData] = useState({
		// Personal Information
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		dateOfBirth: "",
		gender: "",

		// Appointment Details
		appointmentType: "",
		preferredDate: "",
		preferredTime: "",
		reason: "",
		symptoms: "",

		// Medical History
		isNewPatient: "",
		currentMedications: "",
		allergies: "",
		medicalHistory: "",
	})

	const [isSubmitted, setIsSubmitted] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	const nextStep = () => setCurrentStep((prev) => prev + 1)
	const prevStep = () => setCurrentStep((prev) => prev - 1)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setIsSubmitting(true)
		setTimeout(() => {
			setIsSubmitted(true)
			setIsSubmitting(false)
		}, 3000)
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
			{[1, 2, 3, 4, 5].map((step) => (
				<div key={step} className="flex items-center">
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${
							step <= currentStep
								? "bg-primary-600 text-white"
								: "bg-gray-200 text-gray-600"
						}`}>
						{step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
					</div>
					{step < 5 && (
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

	// --- Step 4: PayPal Payment ---
	const renderPayment = () => (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className="space-y-6">
			<h3 className="text-2xl font-semibold text-gray-900 mb-6">
				Secure Payment
			</h3>
			<p className="text-gray-600">
				Please complete the payment to confirm your appointment.
			</p>
			<div className="bg-white border rounded-lg p-6 shadow-sm">
				<PayPalButtons
					style={{ layout: "vertical" }}
					createOrder={(data, actions) => {
						return actions.order.create({
							purchase_units: [
								{
									amount: { value: "50.00" },
								},
							],
						})
					}}
					onApprove={async (data, actions) => {
						const details = await actions.order.capture()
						console.log("Payment successful:", details)
						nextStep()
					}}
					onError={(err) => {
						console.error("Payment error:", err)
						alert("Payment failed. Please try again.")
					}}
				/>
			</div>
		</motion.div>
	)

	// --- Step 5: Confirmation ---
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
		<PayPalScriptProvider options={{ "client-id": "test" }}>
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
								Schedule your visit with Dr. Fatima Kasamnath. Our online
								booking system makes it easy to find a time that works for you.
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
										Thank you for booking your appointment. We've sent a
										confirmation email with all the details.
									</p>
								</motion.div>
							) : (
								<form onSubmit={handleSubmit}>
									{currentStep === 1 && renderPersonalInfo()}
									{currentStep === 2 && renderAppointmentDetails()}
									{currentStep === 3 && renderMedicalInfo()}
									{currentStep === 4 && renderPayment()}
									{currentStep === 5 && renderConfirmation()}

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
										) : currentStep === 5 ? (
											<button
												type="submit"
												disabled={isSubmitting}
												className="btn-primary flex items-center ml-auto disabled:opacity-50">
												{isSubmitting ? (
													"Confirming..."
												) : (
													<>
														<Calendar className="w-5 h-5 mr-2" /> Confirm
														Appointment
													</>
												)}
											</button>
										) : null}
									</div>
								</form>
							)}
						</div>
					</div>
				</section>
			</div>
		</PayPalScriptProvider>
	)
}

export default Appointment
