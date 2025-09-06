import React from "react"

const RazorpayButton = ({ amount, formData, onSuccess }) => {
	const loadRazorpay = () => {
		if (!window.Razorpay) {
			alert("Razorpay SDK not loaded. Please refresh and try again.")
			return
		}

		const options = {
			key: "rzp_test_REORU4W2JT2Anw", // replace with your Razorpay test key
			amount: Math.round(amount * 100), // in paise (₹500 = 50000)
			currency: "INR",
			name: "Clinic Booking",
			description: "Appointment Payment",
			image: "https://your-logo-url.com/logo.png", // optional
			handler: function (response) {
				console.log("✅ Payment successful:", response)
				onSuccess(response)
			},
			prefill: {
				name: `${formData.firstName} ${formData.lastName}`,
				email: formData.email,
				contact: formData.phone,
			},
			notes: {
				appointmentType: formData.appointmentType,
				preferredDate: formData.preferredDate,
			},
			theme: {
				color: "#3399cc",
			},
		}

		const rzp = new window.Razorpay(options)
		rzp.open()
	}

	return (
		<button
			type="button"
			onClick={loadRazorpay}
			className="btn-primary flex items-center ml-auto"
		>
			Pay & Confirm Appointment
		</button>
	)
}

export default RazorpayButton
