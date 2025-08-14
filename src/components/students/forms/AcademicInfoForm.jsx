import React from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { FORM_STYLES, SECTION_OPTIONS } from "../../../utils/constants";

const AcademicInfoForm = ({ formData, handleInputChange }) => {
  const { labelClasses, inputClasses } = FORM_STYLES;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <BookOpenIcon className="w-5 h-5 text-purple-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Academic Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelClasses}>Class Name *</label>
          <input
            type="text"
            name="className"
            value={formData.className}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="10th Grade"
            required
          />
        </div>

        <div>
          <label className={labelClasses}>Section *</label>
          <select
            name="section"
            value={formData.section}
            onChange={handleInputChange}
            className={inputClasses}
            required
          >
            <option value="">Select section</option>
            {SECTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Section {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClasses}>Academic Year *</label>
          <input
            type="text"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="2024-2025"
            required
          />
        </div>

        <div>
          <label className={labelClasses}>Admission Date *</label>
          <input
            type="date"
            name="admissionDate"
            value={formData.admissionDate}
            onChange={handleInputChange}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className={labelClasses}>Roll No</label>
          <input
            type="text"
            name="rollNo"
            value={formData.rollNo}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="001"
          />
        </div>
      </div>
    </div>
  );
};

export default AcademicInfoForm;
