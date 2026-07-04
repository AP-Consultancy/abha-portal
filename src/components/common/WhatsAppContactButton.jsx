import React, { useState } from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { getStudentDisplayName, openWhatsAppForStudent } from "../../utils/whatsappUtils";

const WhatsAppContactButton = ({
  student,
  message = "",
  label = "WhatsApp",
  className = "",
  size = "sm",
  showLabel = true,
}) => {
  const [error, setError] = useState("");

  const handleClick = () => {
    setError("");
    const defaultMessage =
      message ||
      `Hello, this is regarding ${getStudentDisplayName(student)} from the school.`;
    const result = openWhatsAppForStudent(student, defaultMessage);

    if (!result.success) {
      setError(result.message);
      toast.error(result.message);
    }
  };

  const sizeClasses =
    size === "xs"
      ? "px-2 py-1 text-xs"
      : size === "md"
        ? "px-4 py-2 text-sm"
        : "px-2.5 py-1.5 text-xs";

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 rounded-md bg-green-600 text-white hover:bg-green-700 ${sizeClasses} ${className}`}
        title="Contact via WhatsApp"
      >
        <ChatBubbleLeftRightIcon className="h-4 w-4" />
        {showLabel ? label : null}
      </button>
      {error ? <span className="mt-1 text-xs text-red-600">{error}</span> : null}
    </div>
  );
};

export default WhatsAppContactButton;
