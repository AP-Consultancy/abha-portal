import { useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BriefcaseIcon,
  IdentificationIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { teacherService } from "../services/teacherService";
import CSVUpload from "../components/common/CSVUpload";
import {
  ACADEMIC_YEAR_OPTIONS,
  CLASS_OPTIONS,
  SECTION_OPTIONS,
  SUBJECT_OPTIONS,
} from "../utils/constants";

const INITIAL_FORM = {
  enrollmentNo: "",
  name: "",
  email: "",
  contact: "",
  password: "",
  qualification: "",
  specialization: "",
  joiningDate: "",
  salary: "",
  className: "",
  section: "",
  subjectId: "",
  academicYearId: ACADEMIC_YEAR_OPTIONS[0]?.value || "1",
  isClassTeacher: false,
};

export default function TeacherRegistrationForm() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [uploadedCredentials, setUploadedCredentials] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.enrollmentNo.trim()) {
      newErrors.enrollmentNo = "Employee ID is required";
    }
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = "Contact must be 10 digits";
    }
    if (!formData.qualification.trim()) {
      newErrors.qualification = "Qualification is required";
    }
    if (!formData.specialization.trim()) {
      newErrors.specialization = "Specialization is required";
    }
    if (!formData.joiningDate) {
      newErrors.joiningDate = "Joining date is required";
    }
    if (!formData.className) {
      newErrors.className = "Class is required";
    }
    if (!formData.section) {
      newErrors.section = "Section is required";
    }

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

    try {
      await teacherService.createTeacher({
        enrollmentNo: formData.enrollmentNo.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        password: formData.password.trim() || undefined,
        department: formData.qualification.trim(),
        designation: formData.specialization.trim(),
        qualification: formData.qualification.trim(),
        specialization: formData.specialization.trim(),
        joiningDate: formData.joiningDate,
        salary: formData.salary,
        className: formData.className,
        section: formData.section,
        subjectId: formData.subjectId || undefined,
        academicYearId: formData.academicYearId,
        isClassTeacher: formData.isClassTeacher,
      });

      const defaultPassword = formData.password.trim() || formData.enrollmentNo.trim();
      setSubmitMessage("Teacher registered successfully!");
      alert(
        `Teacher registered successfully!\n\nLogin Email: ${formData.email}\nDefault Password: ${defaultPassword}\n\nPlease share these credentials with the teacher.`
      );
      setFormData(INITIAL_FORM);
    } catch (error) {
      setSubmitMessage(error.message || "Failed to register teacher. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkCsvUpload = async (_uploadFormData, file) => {
    setBulkMessage("");
    if (!file) {
      throw new Error("Please select a CSV file to upload.");
    }

    const result = await teacherService.bulkUploadTeachers(file);
    if (result.credentials?.length > 0) {
      setUploadedCredentials(result.credentials);
    }
    setBulkMessage(result.message || "Bulk upload completed.");
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Teacher Registration</h1>
          <p className="text-gray-600">Register a teacher with backend-aligned fields</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bulk import teachers</h2>
                <p className="text-sm text-gray-600">
                  Upload a CSV to create multiple teachers at once (default password =
                  Employee ID).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkUpload((v) => !v)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                {showBulkUpload ? "Hide bulk upload" : "Bulk upload CSV"}
              </button>
            </div>
            {bulkMessage && (
              <p className="mt-3 text-sm text-green-700 bg-white border border-green-200 rounded-lg px-3 py-2">
                {bulkMessage}
              </p>
            )}
            {showBulkUpload && (
              <div className="mt-4">
                <CSVUpload
                  onUpload={handleBulkCsvUpload}
                  title="Upload teacher CSV"
                  description="Uses PostgreSQL sp_bulk_upload_teachers for batch onboarding."
                  entityType="teachers"
                  acceptedFileTypes=".csv"
                  maxFileSize={10}
                  showCredentialExport={Boolean(uploadedCredentials?.length)}
                  credentialData={uploadedCredentials}
                  sampleDownloadUrl="/sample_teacher_bulk_upload.csv"
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <IdentificationIcon className="w-6 h-6 mr-2 text-blue-600" />
                Employee Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    name="enrollmentNo"
                    value={formData.enrollmentNo}
                    onChange={handleChange}
                    className={inputClass("enrollmentNo")}
                    placeholder="e.g. EMP001"
                  />
                  {errors.enrollmentNo && (
                    <p className="mt-1 text-sm text-red-600">{errors.enrollmentNo}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass("name")}
                    placeholder="First and last name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Login Password (optional)
                  </label>
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass("password")}
                    placeholder="Defaults to Employee ID"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <PhoneIcon className="w-6 h-6 mr-2 text-green-600" />
                Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${inputClass("email")} pl-10`}
                      placeholder="teacher@school.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      className={`${inputClass("contact")} pl-10`}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  {errors.contact && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <BriefcaseIcon className="w-6 h-6 mr-2 text-purple-600" />
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification *
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className={inputClass("qualification")}
                    placeholder="e.g. M.Sc. Mathematics"
                  />
                  {errors.qualification && (
                    <p className="mt-1 text-sm text-red-600">{errors.qualification}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={inputClass("specialization")}
                    placeholder="e.g. Mathematics Teacher"
                  />
                  {errors.specialization && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
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
                      className={`${inputClass("joiningDate")} pl-10`}
                    />
                  </div>
                  {errors.joiningDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.joiningDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary (optional)
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className={inputClass("salary")}
                    placeholder="Monthly salary"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpenIcon className="w-6 h-6 mr-2 text-indigo-600" />
                Class Assignment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class *
                  </label>
                  <select
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    className={inputClass("className")}
                  >
                    <option value="">Select class</option>
                    {CLASS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.className && (
                    <p className="mt-1 text-sm text-red-600">{errors.className}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section *
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className={inputClass("section")}
                  >
                    <option value="">Select section</option>
                    {SECTION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.section && (
                    <p className="mt-1 text-sm text-red-600">{errors.section}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject (optional)
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleChange}
                    className={inputClass("subjectId")}
                  >
                    <option value="">Select subject</option>
                    {SUBJECT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year *
                  </label>
                  <select
                    name="academicYearId"
                    value={formData.academicYearId}
                    onChange={handleChange}
                    className={inputClass("academicYearId")}
                  >
                    {ACADEMIC_YEAR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isClassTeacher"
                    name="isClassTeacher"
                    checked={formData.isClassTeacher}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isClassTeacher" className="text-sm font-medium text-gray-700">
                    Class teacher for this class and section
                  </label>
                </div>
              </div>
            </div>

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
