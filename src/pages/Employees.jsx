import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import { teacherService, sectionIdToLabel } from "../services/teacherService";
import CSVUpload from "../components/common/CSVUpload";
import {
  ACADEMIC_YEAR_OPTIONS,
  CLASS_OPTIONS,
  SECTION_OPTIONS,
  SUBJECT_OPTIONS,
} from "../utils/constants";

import {
  ExclamationTriangleIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import TeacherTable from "../components/employees/TeacherTable";

const Teachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setError] = useState(null);
  // CSV Upload state
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [uploadedCredentials, setUploadedCredentials] = useState(null);

  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";
  const inputClasses =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm";

  const initialFormData = {
    enrollmentNo: "",
    name: "",
    email: "",
    contact: "",
    qualification: "",
    specialization: "",
    joiningDate: "",
    salary: "",
  };

  const initialNewAssignment = {
    className: "",
    section: SECTION_OPTIONS[0]?.value || "A",
    subjectId: "",
    academicYearId: ACADEMIC_YEAR_OPTIONS[0]?.value || "1",
    isClassTeacher: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [newAssignment, setNewAssignment] = useState(initialNewAssignment);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [removingAssignmentId, setRemovingAssignmentId] = useState(null);

  const getAllTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data.teachers || data.data || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError(err.message || "Failed to load teachers");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredTeachers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter((teacher) => {
      const haystack = [
        teacher.name,
        teacher.firstName,
        teacher.lastName,
        teacher.email,
        teacher.contact,
        teacher.phone,
        teacher.enrollmentNo,
        teacher.qualification,
        teacher.specialization,
        teacher.classesDisplay,
        teacher.subjectsDisplay,
        teacher.classTeacherDisplay,
        teacher.academicYearsDisplay,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [teachers, searchTerm]);

  // CSV Upload handler
  const handleCSVUpload = async (_formData, file) => {
    try {
      const result = await teacherService.bulkUploadTeachers(file);
      
      // Store credentials for export if provided
      if (result.credentials && result.credentials.length > 0) {
        setUploadedCredentials(result.credentials);
      }
      
      // Refresh the teachers list after successful upload
      await getAllTeachers();
    } catch (error) {
      console.error('CSV upload error:', error);
      throw error;
    }
  };

  useEffect(() => {
    getAllTeachers();
  }, [getAllTeachers]);

  const handleEdit = async (teacher) => {
    try {
      const teacherId = teacher.teacherId || teacher.id;
      const full = teacherId
        ? await teacherService.getTeacherById(teacherId)
        : teacher;
      const t = full || teacher;

      setSelectedTeacher(t);
      setFormData({
        enrollmentNo: t.enrollmentNo || "",
        name: t.name || "",
        email: t.email || "",
        contact: t.contact || "",
        qualification: t.qualification || t.department || "",
        specialization: t.specialization || t.designation || "",
        joiningDate: t.joiningDate || "",
        salary: t.salary ?? "",
      });
      setNewAssignment(initialNewAssignment);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error loading teacher:", err);
      alert(err.message || "Could not load teacher details.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const refreshSelectedTeacher = async () => {
    if (!selectedTeacher) return;
    const teacherId = selectedTeacher.teacherId || selectedTeacher.id;
    if (!teacherId) return;
    const full = await teacherService.getTeacherById(teacherId);
    if (full) setSelectedTeacher(full);
    await getAllTeachers();
  };

  const handleUpdate = async () => {
    if (!selectedTeacher) return;
    setIsUpdating(true);
    try {
      await teacherService.updateTeacher(selectedTeacher.enrollmentNo, {
        ...formData,
        department: formData.qualification,
        designation: formData.specialization,
        qualification: formData.qualification,
        specialization: formData.specialization,
        id: selectedTeacher.id,
        teacherId: selectedTeacher.teacherId || selectedTeacher.id,
        userId: selectedTeacher.userId,
        enrollmentNo: selectedTeacher.enrollmentNo,
      });

      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        setIsModalOpen(false);
        getAllTeachers();
      }, 2000);
    } catch (err) {
      console.error("Update error:", err);
      alert(err.message || "Failed to update teacher.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNewAssignmentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAssignment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAssignment = async () => {
    if (!selectedTeacher) return;
    if (!newAssignment.className || !newAssignment.section) {
      alert("Select class and section to add an assignment.");
      return;
    }
    if (!newAssignment.subjectId) {
      alert("Subject is required for each class assignment.");
      return;
    }

    setIsAddingAssignment(true);
    try {
      const teacherId = selectedTeacher.teacherId || selectedTeacher.id;
      await teacherService.addTeacherAssignment(teacherId, {
        ...newAssignment,
        userId: selectedTeacher.userId,
        teacherId,
      });
      setNewAssignment(initialNewAssignment);
      await refreshSelectedTeacher();
    } catch (err) {
      console.error("Add assignment error:", err);
      alert(err.message || "Failed to add class assignment.");
    } finally {
      setIsAddingAssignment(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!selectedTeacher || !assignmentId) return;
    if (!window.confirm("Remove this class assignment?")) return;

    setRemovingAssignmentId(assignmentId);
    try {
      await teacherService.removeTeacherAssignment(assignmentId, selectedTeacher);
      await refreshSelectedTeacher();
    } catch (err) {
      console.error("Remove assignment error:", err);
      alert(err.message || "Failed to remove assignment.");
    } finally {
      setRemovingAssignmentId(null);
    }
  };

  const formatAssignmentLabel = (assignment) => {
    const classLabel =
      assignment.className ||
      CLASS_OPTIONS.find((o) => String(o.value) === String(assignment.classId))
        ?.label ||
      assignment.classId;
    const section =
      assignment.sectionName ||
      assignment.section ||
      sectionIdToLabel(assignment.sectionId, assignment.classId);
    const subject = assignment.subjectName || "";
    const year = assignment.academicYear || "";
    const parts = [
      [classLabel, section].filter(Boolean).join(" — Section "),
      subject,
      year,
      assignment.isClassTeacher ? "(Class Teacher)" : "",
    ].filter(Boolean);
    return parts.join(" · ");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
    setFormData(initialFormData);
    setNewAssignment(initialNewAssignment);
    setUpdateSuccess(false);
  };

  const handleDelete = async (teacher) => {
    const label = teacher.name || teacher.enrollmentNo || "this teacher";
    if (!window.confirm(`Deactivate ${label}? This removes their login access.`)) return;
    try {
      await teacherService.deleteTeacher(teacher);
      await getAllTeachers();
    } catch (err) {
      alert(err.message || "Failed to delete teacher.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (errors) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-2 text-red-600 mb-2">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <h3 className="font-semibold">Error Loading Teachers</h3>
          </div>
          <p className="text-red-700">{errors}</p>
          <button
            onClick={getAllTeachers}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <PencilIcon className="text-blue-600 h-8 w-8" />
                Employee Management
              </h1>
              <p className="text-gray-600 mt-2">
                Total Employees:{" "}
                <span className="font-semibold text-blue-600">
                  {teachers.length}
                </span>{" "}
                | Filtered:{" "}
                <span className="font-semibold text-green-600">
                  {filteredTeachers.length}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Academic Year</p>
              <p className="text-lg font-semibold text-gray-900">
                {ACADEMIC_YEAR_OPTIONS.find((y) => y.isActive)?.label ||
                  ACADEMIC_YEAR_OPTIONS[0]?.label ||
                  "—"}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <button
                // onClick={() => setShowAddModal(true)}
                onClick={() => {
                  navigate("/add-teacher");
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Teacher</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, employee ID, email, phone, qualification, class, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* CSV Upload Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Bulk Import Teachers</h2>
            <button
              onClick={() => setShowCSVUpload(!showCSVUpload)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              {showCSVUpload ? 'Hide Upload' : 'Show Upload'}
            </button>
          </div>
          
          {showCSVUpload && (
            <CSVUpload
              onUpload={handleCSVUpload}
              title="Upload Teacher Data"
              description="Upload a CSV file to import multiple teachers at once"
              entityType="teachers"
              acceptedFileTypes=".csv"
              maxFileSize={10}
              showCredentialExport={true}
              credentialData={uploadedCredentials}
              sampleDownloadUrl="/sample_teacher_bulk_upload.csv"
            />
          )}
        </div>

        <TeacherTable
          teachers={filteredTeachers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Footer */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              Showing {filteredTeachers.length} of {teachers.length} teachers
            </span>
            <span>Last updated: {new Date().toLocaleDateString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Update Teacher: {selectedTeacher?.name || "Employee"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Employee ID</label>
                    <input
                      type="text"
                      name="enrollmentNo"
                      value={formData.enrollmentNo}
                      className={`${inputClasses} bg-gray-100`}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Phone *</label>
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <BriefcaseIcon className="w-6 h-6 mr-2 text-purple-600" />
                  Professional Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Qualification *</label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      className={inputClasses}
                      placeholder="e.g. M.Sc. Physics"
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Specialization *</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className={inputClasses}
                      placeholder="e.g. Physics Teacher"
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Joining Date *</label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Salary (optional)</label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className={inputClasses}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center">
                    <BookOpenIcon className="w-6 h-6 mr-2 text-indigo-600" />
                    Class assignments
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Update Teacher</strong> saves name, contact, and job details only.
                    To add more classes (like the first teacher in the list), use{" "}
                    <strong>Add assignment</strong> below. Each class + section + subject is one
                    row in the database.
                  </p>
                  {(selectedTeacher?.assignments || []).length > 0 ? (
                    <ul className="space-y-2">
                      {selectedTeacher.assignments.map((assignment) => (
                        <li
                          key={assignment.assignmentId}
                          className="flex items-center justify-between gap-3 rounded-lg border border-indigo-100 bg-white/80 px-4 py-3"
                        >
                          <span className="text-sm text-gray-800">
                            {formatAssignmentLabel(assignment)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveAssignment(assignment.assignmentId)
                            }
                            disabled={removingAssignmentId === assignment.assignmentId}
                            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <TrashIcon className="w-4 h-4" />
                            {removingAssignmentId === assignment.assignmentId
                              ? "Removing…"
                              : "Remove"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      No class assignments yet. Add one below.
                    </p>
                  )}
                </div>

                <div className="border-t border-indigo-100 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Add another class / section
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>Class *</label>
                      <select
                        name="className"
                        value={newAssignment.className}
                        onChange={handleNewAssignmentChange}
                        className={inputClasses}
                      >
                        <option value="">Select class</option>
                        {CLASS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>Section *</label>
                      <select
                        name="section"
                        value={newAssignment.section}
                        onChange={handleNewAssignmentChange}
                        className={inputClasses}
                      >
                        {SECTION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>Subject *</label>
                      <select
                        name="subjectId"
                        value={newAssignment.subjectId}
                        onChange={handleNewAssignmentChange}
                        className={inputClasses}
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
                      <label className={labelClasses}>Academic Year *</label>
                      <select
                        name="academicYearId"
                        value={newAssignment.academicYearId}
                        onChange={handleNewAssignmentChange}
                        className={inputClasses}
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
                        id="editIsClassTeacher"
                        name="isClassTeacher"
                        checked={newAssignment.isClassTeacher}
                        onChange={handleNewAssignmentChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <label htmlFor="editIsClassTeacher" className="text-sm text-gray-700">
                        Class teacher for this class and section
                      </label>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddAssignment}
                      disabled={isAddingAssignment}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isAddingAssignment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Adding…
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-5 h-5" />
                          Add assignment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                  disabled={isUpdating || updateSuccess}
                  className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl ${
                    updateSuccess
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  }`}
                >
                  {updateSuccess ? (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>Teacher Updated!</span>
                    </>
                  ) : isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <PencilIcon className="w-5 h-5" />
                      <span>Update Teacher</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
