// src/components/students/forms/HealthAdminForm.jsx
import React from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { FORM_STYLES, STATUS_OPTIONS } from "../../../utils/constants";

const HealthAdminForm = ({ formData, handleInputChange }) => {
  const { labelClasses, inputClasses } = FORM_STYLES;

  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <HeartIcon className="w-5 h-5 text-red-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Health & Administrative Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Medical Conditions</label>
          <input
            type="text"
            name="medicalConditions"
            value={formData.medicalConditions}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="Asthma, Allergy (comma separated)"
          />
        </div>

        <div>
          <label className={labelClasses}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={inputClasses}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClasses}>Created By</label>
          <input
            type="text"
            name="createdBy"
            value={formData.createdBy}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="Admin name"
          />
        </div>

        <div>
          <label className={labelClasses}>Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="Any additional remarks"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export { TransportInfoForm, HealthAdminForm };
