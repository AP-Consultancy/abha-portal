import { useState } from "react";
import CSVUpload from "../components/common/CSVUpload";
import { studentService } from "../services/studentService";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../utils/constants";

const CreateStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    scholarNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dob: "",
    aadhaarNo: "",
    sssmid: "",
    panNo: "",
    apaarId: "",

    className: "",
    section: "",
    admissionDate: "",
    admissionNo: "",
    rollNo: "",

    phone: "",
    alternateContactNo: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },

    father: {
      name: "",
      phone: "",
      email: "",
      relation: "Father",
    },

    mother: {
      name: "",
      phone: "",
      email: "",
      relation: "Mother",
    },

  });
  const [availableClasses] = useState(CLASS_OPTIONS);
  const [availableSections] = useState(SECTION_OPTIONS);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [uploadedCredentials, setUploadedCredentials] = useState(null);

  const handleBulkCsvUpload = async (_formData, file) => {
    setBulkMessage("");
    if (!file) {
      throw new Error("Please select a CSV file to upload.");
    }
    const result = await studentService.bulkUploadStudents(file);
    if (result.credentials?.length > 0) {
      setUploadedCredentials(result.credentials);
    }
    setBulkMessage(result.message || "Bulk upload completed.");
    setTimeout(() => navigate("/students"), 1500);
  };

  // Class + section lists are now static to match PostgreSQL masters.

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? e.target.checked : undefined;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] ?? {}),
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async () => {
    const payload = { ...formData };

    console.log("Student Data:", payload);

    try {
      const data = await studentService.createStudent(payload);
      console.log("Response Data:", data);
      
      // Show success message with default password information
      alert(
        `Student created successfully!\n\nScholar Number: ${
          formData.scholarNumber || "Saved"
        }\nDefault Password: ${formData.scholarNumber || "student@123"}\n\nPlease share these credentials with the student.`
      );
      
      setIsSubmitted(true);
      navigate("/students");
    } catch (error) {
      console.error("Error creating student:", error);
      alert(error.message || "Failed to create student. Please try again.");
    }
  };

  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <AcademicCapIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Student
          </h1>
          <p className="text-gray-600">
            Fill in the student details below to register them in the system
          </p>
        </div>

        <div className="mb-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bulk import students</h2>
              <p className="text-sm text-gray-600">
                Upload a CSV to create many students at once (password = scholar number).
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
            <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {bulkMessage}
            </p>
          )}
          {showBulkUpload && (
            <div className="mt-4">
              <CSVUpload
                onUpload={handleBulkCsvUpload}
                title="Upload student CSV"
                description="Use Class Name (8th, 10th, KG1) and Section (A, B, C) in the CSV — not database ids. Fees are assigned from the class fee structure."
                entityType="students"
                acceptedFileTypes=".csv"
                maxFileSize={10}
                showCredentialExport={Boolean(uploadedCredentials?.length)}
                credentialData={uploadedCredentials}
                sampleDownloadUrl="/sample_student_bulk_upload.csv"
              />
            </div>
          )}
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8">
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <UserIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Basic Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClasses}>Scholar Number *</label>
                    <input
                      type="text"
                      name="scholarNumber"
                      value={formData.scholarNumber}
                      onChange={handleInputChange}
                      className={inputClasses}
                      placeholder="Enter scholar number"
                      required
                    />
                  </div>

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
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
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
                    <label className={labelClasses}>Aadhaar No</label>
                    <input
                      type="text"
                      name="aadhaarNo"
                      value={formData.aadhaarNo}
                      onChange={handleInputChange}
                      className={inputClasses}
                      placeholder="12 digit Aadhaar"
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>SSSMID</label>
                    <input
                      type="text"
                      name="sssmid"
                      value={formData.sssmid}
                      onChange={handleInputChange}
                      className={inputClasses}
                      placeholder="SSSMID"
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>PAN No</label>
                    <input
                      type="text"
                      name="panNo"
                      value={formData.panNo}
                      onChange={handleInputChange}
                      className={inputClasses}
                      placeholder="PAN number"
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>APAAR ID</label>
                    <input
                      type="text"
                      name="apaarId"
                      value={formData.apaarId}
                      onChange={handleInputChange}
                      className={inputClasses}
                      placeholder="APAAR ID"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
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
                    <select
                      name="className"
                      value={formData.className}
                      onChange={handleInputChange}
                      className={inputClasses}
                      required
                    >
                      <option value="">Select class</option>
                      {availableClasses.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
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
                      {availableSections.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClasses}>Admission No</label>
                    <input
                      type="text"
                      name="admissionNo"
                      value={formData.admissionNo}
                      onChange={handleInputChange}
                      className={inputClasses}
                      placeholder="e.g. 2025-001"
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

              {/* Contact Information Section */}
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

                  <div>
                    <label className={labelClasses}>Alternate Contact Number</label>
                    <input
                      type="tel"
                      name="alternateContactNo"
                      value={formData.alternateContactNo}
                      onChange={handleInputChange}
                      className={inputClasses}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center mb-4">
                    <MapPinIcon className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Address
                    </h3>
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

              {/* Parent Information Section */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <UsersIcon className="w-5 h-5 text-yellow-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Parent Information
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

              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`
                    px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center space-x-2
                    ${
                      isSubmitted
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    }
                    shadow-lg hover:shadow-xl
                  `}
                  disabled={isSubmitted}
                >
                  {isSubmitted ? (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>Student Created Successfully!</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="w-5 h-5" />
                      <span>Create Student</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudent;
