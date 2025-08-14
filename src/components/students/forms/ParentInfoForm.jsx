import React from "react";
import { UsersIcon } from "@heroicons/react/24/outline";
import { FORM_STYLES } from "../../../utils/constants";

const ParentInfoForm = ({ formData, handleInputChange }) => {
  const { labelClasses, inputClasses } = FORM_STYLES;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <UsersIcon className="w-5 h-5 text-yellow-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Parent/Guardian Information
        </h2>
      </div>

      {/* Father Info */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Father's Information *
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClasses}>Father's Name *</label>
            <input
              type="text"
              name="father.name"
              value={formData.father.name}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="Enter father's name"
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Father's Phone *</label>
            <input
              type="tel"
              name="father.phone"
              value={formData.father.phone}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Father's Email</label>
            <input
              type="email"
              name="father.email"
              value={formData.father.email}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="father@example.com"
            />
          </div>
        </div>
      </div>

      {/* Mother Info */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Mother's Information *
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClasses}>Mother's Name *</label>
            <input
              type="text"
              name="mother.name"
              value={formData.mother.name}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="Enter mother's name"
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Mother's Phone *</label>
            <input
              type="tel"
              name="mother.phone"
              value={formData.mother.phone}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Mother's Email</label>
            <input
              type="email"
              name="mother.email"
              value={formData.mother.email}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="mother@example.com"
            />
          </div>
        </div>
      </div>

      {/* Guardian Info */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Guardian Information (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className={labelClasses}>Guardian's Name</label>
            <input
              type="text"
              name="guardian.name"
              value={formData.guardian.name}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="Enter guardian's name"
            />
          </div>

          <div>
            <label className={labelClasses}>Guardian's Phone</label>
            <input
              type="tel"
              name="guardian.phone"
              value={formData.guardian.phone}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className={labelClasses}>Guardian's Email</label>
            <input
              type="email"
              name="guardian.email"
              value={formData.guardian.email}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="guardian@example.com"
            />
          </div>

          <div>
            <label className={labelClasses}>Relation</label>
            <input
              type="text"
              name="guardian.relation"
              value={formData.guardian.relation}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="Uncle, Aunt, etc."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentInfoForm;
