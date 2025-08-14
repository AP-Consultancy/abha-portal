import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ErrorMessage = ({ error, onRetry, title = "Error Loading Students" }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="flex items-center space-x-2 text-red-600 mb-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
