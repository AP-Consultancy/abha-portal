import React from "react";

const LoadingSpinner = ({ size = "md", message = "" }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600 mx-auto`}
        ></div>
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;

// src/components/common/ErrorMessage.jsx
