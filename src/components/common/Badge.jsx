// src/components/common/Badge.jsx
import React from "react";
import { getStatusBadgeClasses } from "../../utils/studentUtils";

const Badge = ({ status, children, variant = "default", className = "" }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "status":
        return getStatusBadgeClasses(status);
      case "info":
        return "px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800";
      case "warning":
        return "px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800";
      case "success":
        return "px-2 py-1 rounded-full text-xs bg-green-100 text-green-800";
      case "filter":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
      default:
        return "px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`${getVariantClasses()} ${className}`}>{children}</span>
  );
};

export default Badge;
