import React from "react"

const RazorpayButton = ({ amount, formData, onPaymentSuccess }) => {
	const loadRazorpay = () => {
		if (!window.Razorpay) {
			alert("Razorpay SDK not loaded. Please refresh and try again.")
			return
		}

		const options = {
			key: "rzp_test_REORU4W2JT2Anw",
			amount: Math.round(amount * 100), // in paise
			currency: "INR",
			name: "Clinic Booking",
			description: "Appointment Payment",
			prefill: {
				name: `${formData.firstName} ${formData.lastName}`,
				email: formData.email,
				contact: formData.phone,
			},
			handler: function (response) {
				if (onPaymentSuccess) onPaymentSuccess(response)
			},
			theme: { color: "#3399cc" },
		}

		const rzp = new window.Razorpay(options)
		rzp.on("payment.failed", () => {
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
