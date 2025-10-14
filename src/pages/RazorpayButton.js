import React from "react"

const RazorpayButton = ({ amount, formData, onPaymentSuccess, selectedService }) => {
	const loadRazorpay = () => {
		if (!window.Razorpay) {
			alert("Razorpay SDK not loaded. Please refresh and try again.")
			return
		}

		// Calculate amount based on selected service or use provided amount
		let paymentAmount = amount
		if (selectedService && selectedService.price) {
			// Use the minimum price from INR pricing
			paymentAmount = selectedService.price.inr?.min || selectedService.price.min * 100
		}

		const options = {
			key: "rzp_live_RL4t8lq29IQAcb",
			amount: paymentAmount * 100, // Convert to paise
			currency: "INR",
			name: "Dr. Fatima Kasamnath Clinic",
			description: `Appointment Payment - ${
				selectedService?.title || "Service"
			}`,
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

	const formatPrice = (service) => {
		if (!service || !service.price) return "₹500"
		const price = service.price.inr || service.price
		return `₹${price.min.toLocaleString()}`
	}

	return (
		<div className="flex flex-col items-end space-y-3">
			<button
				type="button"
				onClick={loadRazorpay}
				className="btn-primary flex items-center">
				Pay {formatPrice(selectedService)} & Confirm Appointment
			</button>
			<p className="text-xs text-gray-700 text-right">
				Secure payment powered by Razorpay
			</p>
		</div>
	)
}

export default RazorpayButton
