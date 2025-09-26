import React, { useState, useEffect } from "react"
import { Star } from "lucide-react"
import "./ReviewSlider.css"

const ReviewSlider = ({ reviews }) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [animation, setAnimation] = useState("slide-in") // 'slide-in' or 'slide-out'

	useEffect(() => {
		if (reviews.length <= 1) return

		const interval = setInterval(() => {
			setAnimation("slide-out")

			setTimeout(() => {
				setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
				setAnimation("slide-in")
			}, 600) // Must match CSS animation duration
		}, 3000)

		return () => clearInterval(interval)
	}, [reviews.length])

	if (reviews.length === 0) {
		return null
	}

	const currentReview = reviews[currentIndex]

	return (
		<div className="review-slider-container">
			<div key={currentIndex} className={`review-card-active ${animation}`}>
				<div className="flex items-center mb-4">
					{[...Array(currentReview.rating)].map((_, i) => (
						<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
					))}
				</div>
				<p className="text-gray-600 mb-4 italic">"{currentReview.review}"</p>
				<p className="font-semibold text-gray-900">- {currentReview.name}</p>
			</div>
		</div>
	)
}

export default ReviewSlider