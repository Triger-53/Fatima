import React from "react"
import { supabase } from "../supabase"

const RazorpayButton = ({ amount, formData, onSuccess }) => {
	const loadRazorpay = () => {
		if (!window.Razorpay) {
			alert("Razorpay SDK not loaded. Please refresh and try again.")
			return
		}

		const options = {
			key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_REORU4W2JT2Anw",
			amount: Math.round(amount * 100), // in paise
			currency: "INR",
			name: "Clinic Booking",
			description: "Appointment Payment",
			handler: async function (response) {
				console.log("✅ Payment successful:", response)

				// Save appointment in Supabase
				const { data, error } = await supabase.from("Appointment").insert([
					{
						first_name: formData.firstName,
						last_name: formData.lastName,
						email: formData.email,
						phone: formData.phone,
						date_of_birth: formData.dateOfBirth,
						gender: formData.gender,
						appointment_type: formData.appointmentType,
						preferred_date: formData.preferredDate,
						preferred_time: formData.preferredTime,
						reason: formData.reason,
						symptoms: formData.symptoms,
						is_new_patient: formData.isNewPatient,
						current_medications: formData.currentMedications,
						allergies: formData.allergies,
						medical_history: formData.medicalHistory,
						// payment_id: response.razorpay_payment_id,
					},
				])

				if (error) {
					console.error("❌ Supabase insert error:", error.message)
					alert(
						"Something went wrong saving your appointment. Please contact support."
					)
				} else {
					console.log("✅ Appointment saved:", data)
					if (onSuccess) onSuccess(response)
				}
			},
			prefill: {
				name: `${formData.firstName} ${formData.lastName}`,
				email: formData.email,
				contact: formData.phone,
			},
			theme: {
				color: "#3399cc",
			},
		}

		const rzp = new window.Razorpay(options)
		rzp.on("payment.failed", (err) => {
			console.error("❌ Payment failed:", err.error)
			alert("Payment failed. Please try again.")
		})
		rzp.open()
	}

	return (
		<button
			type="button"
			onClick={loadRazorpay}
			className="btn-primary flex items-center ml-auto">
			Pay & Confirm Appointment
		</button>
	)
}

export default RazorpayButton
