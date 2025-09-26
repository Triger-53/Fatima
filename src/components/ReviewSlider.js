import React from "react"
import "./ReviewSlider.css"
import { Star } from "lucide-react"

const ReviewSlider = ({ reviews }) => {
	const duplicatedReviews = [...reviews, ...reviews]

	return (
		<div className="review-slider-container">
			<div className="review-track">
				{duplicatedReviews.map((review, index) => (
					<div className="review-card" key={index}>
						<div className="flex items-center mb-4">
							{[...Array(review.rating)].map((_, i) => (
								<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
							))}
						</div>
						<p className="text-gray-600 mb-4 italic">"{review.review}"</p>
						<p className="font-semibold text-gray-900">- {review.name}</p>
					</div>
				))}
			</div>
		</div>
	)
}

export default ReviewSlider