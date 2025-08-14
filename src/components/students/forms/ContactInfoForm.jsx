import React from "react";
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { FORM_STYLES } from "../../../utils/constants";

const ContactInfoForm = ({ formData, handleInputChange }) => {
  const { labelClasses, inputClasses } = FORM_STYLES;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <PhoneIcon className="w-5 h-5 text-green-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Contact Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className={labelClasses}>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label className={labelClasses}>Email Address</label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`${inputClasses} pl-12`}
              placeholder="student@example.com"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center mb-4">
          <MapPinIcon className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Address</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClasses}>Street Address</label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label className={labelClasses}>City</label>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="Mumbai"
            />
          </div>

          <div>
            <label className={labelClasses}>State</label>
            <input
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="Maharashtra"
            />
          </div>

          <div>
            <label className={labelClasses}>Postal Code</label>
            <input
              type="text"
              name="address.postalCode"
              value={formData.address.postalCode}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="400001"
            />
          </div>

          <div>
            <label className={labelClasses}>Country</label>
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="India"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoForm;
