import React, { useState, useEffect } from "react"
import { Star } from "lucide-react"
import "./MultiReviewSlider.css"

const MultiReviewSlider = ({ reviews }) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isTransitioning, setIsTransitioning] = useState(true)
	const [itemsToDisplay, setItemsToDisplay] = useState(3)

	// Function to determine how many items to display based on screen size
	const updateItemsToDisplay = () => {
		if (window.innerWidth <= 640) {
			setItemsToDisplay(1)
		} else if (window.innerWidth <= 1024) {
			setItemsToDisplay(2)
		} else {
			setItemsToDisplay(3)
		}
	}

	// Clone the first few items for a seamless loop
	const clonedForLoop =
		reviews.length > itemsToDisplay ? reviews.slice(0, itemsToDisplay) : []
	const extendedReviews = [...reviews, ...clonedForLoop]

	// Handle window resize
	useEffect(() => {
		updateItemsToDisplay()
		const handleResize = () => {
			updateItemsToDisplay()
		}
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	useEffect(() => {
		if (reviews.length <= itemsToDisplay) {
			return
		}

		const intervalId = setInterval(() => {
			setCurrentIndex((prevIndex) => prevIndex + 1)
		}, 3000)

		return () => clearInterval(intervalId)
	}, [reviews.length, itemsToDisplay])

	useEffect(() => {
		// This effect runs after a jump to re-enable transitions
		if (!isTransitioning) {
			setTimeout(() => {
				setIsTransitioning(true)
			}, 50) // A brief delay to ensure the state update is processed
		}
	}, [isTransitioning])

	const handleTransitionEnd = () => {
		if (currentIndex >= reviews.length) {
			// After sliding to the cloned items, jump back to the start without a transition
			setIsTransitioning(false)
			setCurrentIndex(0)
		}
	}

	if (reviews.length === 0) {
		return null
	}

	// Calculate the transform based on the actual card width including margins
	const getTransformValue = () => {
		if (itemsToDisplay === 1) {
			return currentIndex * 100
		} else if (itemsToDisplay === 2) {
			return currentIndex * 50
		} else {
			return currentIndex * 33.333
		}
	}

	return (
		<div className="multi-review-slider-container">
			<div
				className="multi-review-track"
				onTransitionEnd={handleTransitionEnd}
				style={{
					transform: `translateX(-${getTransformValue()}%)`,
					transition: isTransitioning ? "transform 0.5s ease-in-out" : "none",
				}}>
				{extendedReviews.map((review, index) => (
					<div className="multi-review-card" key={index}>
						<div className="flex items-center mb-4">
							{[...Array(review.rating)].map((_, i) => (
								<Star
									key={i}
									className="w-5 h-5 text-yellow-400 fill-current"
								/>
							))}
						</div>
						<p className="text-gray-600 mb-4 italic flex-grow review-text">"{review.review}"</p>
						<p className="font-semibold text-gray-900">- {review.name}</p>
					</div>
				))}
			</div>
		</div>
	)
}

export default MultiReviewSlider