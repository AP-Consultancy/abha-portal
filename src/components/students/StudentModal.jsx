import React, { useState } from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import BasicInfoForm from "./forms/BasicInfoForm";
import AcademicInfoForm from "./forms/AcademicInfoForm";
import ContactInfoForm from "./forms/ContactInfoForm";
import ParentInfoForm from "./forms/ParentInfoForm";
import { TransportInfoForm, HealthAdminForm } from "./forms/TransportInfoForm";
import { transformFormDataForUpdate } from "../../utils/studentUtils";

const StudentModal = ({
  isOpen,
  selectedStudent,
  formData,
  setFormData,
  onClose,
  onUpdate,
  isUpdating,
  updateSuccess,
}) => {
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = e.target.checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent) return;

    const updateData = transformFormDataForUpdate(formData);
    await onUpdate(selectedStudent.enrollmentNo, updateData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Update Student: {selectedStudent?.firstName}{" "}
            {selectedStudent?.lastName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-8">
              <div className="space-y-8">
                {/* Basic Information Section */}
                <BasicInfoForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                />

                {/* Academic Information Section */}
                <AcademicInfoForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                />

                {/* Contact Information Section */}
                <ContactInfoForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                />

                {/* Parent/Guardian Information Section */}
                <ParentInfoForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                />

                {/* Transport Information Section */}
                <TransportInfoForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                />

                {/* Health & Administrative Section */}
                <HealthAdminForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                />

                {/* Submit Button */}
                <div className="flex justify-center space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-4 rounded-xl font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={`
                      px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center space-x-2
                      ${
                        updateSuccess
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      }
                      shadow-lg hover:shadow-xl
                    `}
                    disabled={isUpdating || updateSuccess}
                  >
                    {updateSuccess ? (
                      <>
                        <CheckIcon className="w-5 h-5" />
                        <span>Student Updated Successfully!</span>
                      </>
                    ) : isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-5 h-5" />
                        <span>Update Student</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentModal;
