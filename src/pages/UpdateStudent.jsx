import React from "react";

const UpdateStudent = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Update Student: {selectedStudent?.firstName}{" "}
            {selectedStudent?.lastName}
          </h2>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-8">
              <div className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
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
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClasses}>Date of Birth *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
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
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
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

                {/* Academic Information Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
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
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
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

                {/* Contact Information Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <Phone className="w-5 h-5 text-green-600 mr-2" />
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
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
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
                      <MapPin className="w-5 h-5 text-green-600 mr-2" />
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

                {/* Parent/Guardian Information Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <Users className="w-5 h-5 text-yellow-600 mr-2" />
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

                {/* Transport Information Section */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <Bus className="w-5 h-5 text-cyan-600 mr-2" />
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

                {/* Health & Administrative Section */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <Heart className="w-5 h-5 text-red-600 mr-2" />
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
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Transfered">Transferred</option>
                        <option value="Graduated">Graduated</option>
                        <option value="Dropped">Dropped</option>
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

                {/* Submit Button */}
                <div className="flex justify-center space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-8 py-4 rounded-xl font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
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
                        <Check className="w-5 h-5" />
                        <span>Student Updated Successfully!</span>
                      </>
                    ) : isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
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

export default UpdateStudent;
