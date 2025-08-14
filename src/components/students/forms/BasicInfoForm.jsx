import React from "react";
import { UserIcon, CalendarIcon } from "@heroicons/react/24/outline";
import {
  FORM_STYLES,
  GENDER_OPTIONS,
  BLOOD_GROUP_OPTIONS,
} from "../../../utils/constants";

const BasicInfoForm = ({ formData, handleInputChange }) => {
  const { labelClasses, inputClasses } = FORM_STYLES;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <UserIcon className="w-5 h-5 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Basic Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelClasses}>First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="Enter first name"
            required
          />
        </div>

        <div>
          <label className={labelClasses}>Middle Name</label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="Enter middle name"
          />
        </div>

        <div>
          <label className={labelClasses}>Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="Enter last name"
            required
          />
        </div>

        <div>
          <label className={labelClasses}>Gender *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={inputClasses}
            required
          >
            <option value="">Select gender</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClasses}>Date of Birth *</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className={`${inputClasses} pl-12`}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Blood Group</label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleInputChange}
            className={inputClasses}
          >
            <option value="">Select blood group</option>
            {BLOOD_GROUP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClasses}>Religion</label>
          <input
            type="text"
            name="religion"
            value={formData.religion}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="Enter religion"
          />
        </div>

        <div>
          <label className={labelClasses}>Caste</label>
          <input
            type="text"
            name="caste"
            value={formData.caste}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="Enter caste"
          />
        </div>

        <div>
          <label className={labelClasses}>Nationality</label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="Indian"
          />
        </div>

        <div>
          <label className={labelClasses}>Photo URL</label>
          <input
            type="url"
            name="photoUrl"
            value={formData.photoUrl}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="https://example.com/photo.jpg"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
