import React from "react";

interface StarRatingProps {
  rating: number;
}

const StarRating = ({ rating }: StarRatingProps) => {
  const clampedRating = Math.max(0, Math.min(5, rating));

  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className="flex items-center">
      {stars.map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${
            star <= clampedRating ? "text-yellow-500" : "text-gray-300"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.12-6.54L.244 7.91l6.536-.948L10 1l2.22 5.962 6.536.948-4.997 3.64 1.12 6.54L10 15z" />
        </svg>
      ))}
    </div>
  );
};

export default StarRating;
