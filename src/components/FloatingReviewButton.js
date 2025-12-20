import React from "react";
import { MessageSquarePlus } from "lucide-react";

const FloatingReviewButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-110 z-40"
      aria-label="Leave a review"
    >
      <MessageSquarePlus className="w-8 h-8" />
    </button>
  );
};

export default FloatingReviewButton;