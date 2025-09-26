import React from "react";
import { MessageSquarePlus } from "lucide-react";

const FloatingReviewButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors duration-300 z-40"
      aria-label="Leave a review"
    >
      <MessageSquarePlus className="w-8 h-8" />
    </button>
  );
};

export default FloatingReviewButton;