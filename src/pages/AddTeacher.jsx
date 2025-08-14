import { useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  BriefcaseIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function TeacherRegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    alternateContact: "",
    gender: "",
    dob: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    designation: "",
    department: "",
    joiningDate: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1]; // e.g., "street"
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));

      // Clear errors for address fields if needed
      if (errors.address && errors.address[key]) {
        setErrors((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            [key]: "",
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.contact.trim())
      newErrors.contact = "Contact number is required";
    else if (!/^\d{10}$/.test(formData.contact))
      newErrors.contact = "Contact must be 10 digits";
    if (
      formData.alternateContact &&
      !/^\d{10}$/.test(formData.alternateContact)
    ) {
      newErrors.alternateContact = "Alternate contact must be 10 digits";
    }
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.address.street.trim())
      newErrors.address = {
        ...newErrors.address,
        street: "Street is required",
      };
    if (!formData.address.city.trim())
      newErrors.address = { ...newErrors.address, city: "City is required" };
    if (!formData.address.state.trim())
      newErrors.address = { ...newErrors.address, state: "State is required" };
    if (!formData.address.zip.trim())
      newErrors.address = { ...newErrors.address, zip: "Zip is required" };
    if (!formData.address.country.trim())
      newErrors.address = {
        ...newErrors.address,
        country: "Country is required",
      };
    if (!formData.designation.trim())
      newErrors.designation = "Designation is required";
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (!formData.joiningDate)
      newErrors.joiningDate = "Joining date is required";

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");
    console.log("Form Data:", formData);
    try {
      const token = localStorage.getItem("token");

      // Simulate API call - replace with actual API endpoint
      const response = await fetch(
        "http://localhost:5000/api/teachers/create-teacher",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubmitMessage("Teacher registered successfully!");
        
        // Show success message with default password information
        alert(`Teacher registered successfully!\n\nEnrollment Number: ${data.teacher.enrollmentNo}\nDefault Password: ${data.defaultPassword}\n\nPlease share these credentials with the teacher.`);
        
        setFormData({
          name: "",
          email: "",
          contact: "",
          alternateContact: "",
          gender: "",
          dob: "",
          address: {
            street: "",
            city: "",
            state: "",
            zip: "",
            country: "",
          },
          designation: "",
          department: "",
          joiningDate: "",
          status: "Active",
        });
      } else {
        const errorData = await response.json();
        setSubmitMessage(
          `Error: ${errorData.message || "Registration failed"}`
        );
      }
    } catch (error) {
      setSubmitMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Teacher Registration
          </h1>
          <p className="text-gray-600">Join our academic community</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.dob ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.dob && (
                    <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>

                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="Street"
                  className={`w-full mb-2 px-3 py-2 border rounded ${
                    errors.address?.street
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.address?.street && (
                  <p className="text-red-600 text-sm mb-1">
                    {errors.address.street}
                  </p>
                )}

                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={`w-full mb-2 px-3 py-2 border rounded ${
                    errors.address?.city ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.address?.city && (
                  <p className="text-red-600 text-sm mb-1">
                    {errors.address.city}
                  </p>
                )}

                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={`w-full mb-2 px-3 py-2 border rounded ${
                    errors.address?.state ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.address?.state && (
                  <p className="text-red-600 text-sm mb-1">
                    {errors.address.state}
                  </p>
                )}

                <input
                  type="text"
                  name="address.zip"
                  value={formData.address.zip}
                  onChange={handleChange}
                  placeholder="Zip"
                  className={`w-full mb-2 px-3 py-2 border rounded ${
                    errors.address?.zip ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.address?.zip && (
                  <p className="text-red-600 text-sm mb-1">
                    {errors.address.zip}
                  </p>
                )}

                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className={`w-full mb-2 px-3 py-2 border rounded ${
                    errors.address?.country
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.address?.country && (
                  <p className="text-red-600 text-sm mb-1">
                    {errors.address.country}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <PhoneIcon className="w-6 h-6 mr-2 text-green-600" />
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.contact ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter 10-digit contact number"
                    />
                  </div>
                  {errors.contact && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Contact
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="alternateContact"
                      value={formData.alternateContact}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.alternateContact
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter alternate contact (optional)"
                    />
                  </div>
                  {errors.alternateContact && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.alternateContact}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="pb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <BriefcaseIcon className="w-6 h-6 mr-2 text-purple-600" />
                Professional Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation *
                  </label>
                  <div className="relative">
                    <CheckCircleIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.designation
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., Assistant Professor, Lecturer"
                    />
                  </div>
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.designation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.department ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Computer Science, Mathematics"
                    />
                  </div>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joining Date *
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.joiningDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.joiningDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.joiningDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Registering..." : "Register Teacher"}
              </button>
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div
                className={`text-center p-4 rounded-lg ${
                  submitMessage.includes("successfully")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {submitMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
