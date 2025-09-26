import React, { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { addReviewAsync } from "../data/reviews";

const ReviewModal = ({ isOpen, onClose, onReviewSubmitted }) => {
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newReview = await addReviewAsync({ name, review });
      setName("");
      setReview("");
      setIsSubmitted(true);
      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, 2000);
    } catch (error) {
      setError(error.message);
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Leave a Review
        </h3>
        {isSubmitted ? (
          <div className="text-center text-medical-600 p-4 bg-medical-50 rounded-lg">
            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">Thank you for your review!</h4>
            <p>Your feedback helps us improve our services.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-2"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="review"
                className="block text-gray-700 font-medium mb-2"
              >
                Your Review
              </label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                rows="4"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="text-center">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;