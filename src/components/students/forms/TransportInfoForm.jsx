import React from "react";
import { TruckIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { FORM_STYLES, STATUS_OPTIONS } from "../../../utils/constants";
const TransportInfoForm = ({ formData, handleInputChange }) => {
  const { labelClasses, inputClasses } = FORM_STYLES;

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <TruckIcon className="w-5 h-5 text-cyan-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Transport Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="transportOpted"
            checked={formData.transportOpted}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="ml-2 text-sm font-medium text-gray-700">
            Transport Opted
          </label>
        </div>

        <div>
          <label className={labelClasses}>Bus Route</label>
          <input
            type="text"
            name="busRoute"
            value={formData.busRoute}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="Route 1"
            disabled={!formData.transportOpted}
          />
        </div>

        <div>
          <label className={labelClasses}>Pickup Point</label>
          <input
            type="text"
            name="pickupPoint"
            value={formData.pickupPoint}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="Main Gate"
            disabled={!formData.transportOpted}
          />
        </div>
      </div>
    </div>
  );
};

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
