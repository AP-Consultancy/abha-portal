import React, { useEffect, useState } from "react";
import { useStudents } from "../../hooks/useStudents";
import { useStudentFilters } from "../../hooks/useStudentFilters";
import { transformStudentForEdit } from "../../utils/studentUtils";
import { INITIAL_FORM_DATA } from "../../utils/constants";
import { studentService } from "../../services/studentService";

// Components
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import CSVUpload from "../common/CSVUpload";
import StudentHeader from "./StudentHeader";
import StudentFilters from "./StudentFilters";
import StudentTable from "./StudentTable";
import StudentModal from "./StudentModal";
import StudentPagination from "./StudentPagination";
import { STUDENT_PAGE_SIZE } from "../../services/studentService";

const Students = () => {
  const {
    students,
    loading,
    error,
    page,
    setPage,
    total,
    totalPages,
    filterOptions,
    fetchStudents,
    updateStudent,
    deleteStudent,
  } = useStudents();

  const {
    searchTerm,
    setSearchTerm,
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
    selectedYear,
    setSelectedYear,
    filteredStudents,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
  } = useStudentFilters(students);

  useEffect(() => {
    if (selectedSection && !selectedClass) {
      setSelectedSection("");
    }
    setPage(1);
    fetchStudents({
      classId: selectedClass,
      section: selectedClass ? selectedSection : "",
      academicYearId: selectedYear,
      page: 1,
    });
  }, [selectedClass, selectedSection, selectedYear]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    fetchStudents({
      classId: selectedClass,
      section: selectedSection,
      academicYearId: selectedYear,
      page: nextPage,
    });
  };

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // CSV Upload state
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [uploadedCredentials, setUploadedCredentials] = useState(null);
  const [uploadSummary, setUploadSummary] = useState("");

  const downloadCredentialsCsv = () => {
    if (!uploadedCredentials || uploadedCredentials.length === 0) return;
    const headers = [
      'Scholar No/Enrollment No',
      'One-Time Password',
      'Login URL',
    ];
    const rows = uploadedCredentials.map((cred) => [
      cred.identifier,
      cred.password,
      `${window.location.origin}/login`,
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_login_credentials.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCSVUpload = async (_formData, file) => {
    if (!file) {
      throw new Error("Please select a CSV file to upload.");
    }

    setUploadSummary("");
    const result = await studentService.bulkUploadStudents(file);

    if (result?.credentials?.length > 0) {
      setUploadedCredentials(result.credentials);
    }

    setUploadSummary(result?.message || "Upload completed.");

    if (result?.failed > 0) {
      const preview = (result.failedStudents || [])
        .slice(0, 3)
        .map((f) => `Row ${f.row}: ${f.reason}`)
        .join(" | ");
      throw new Error(`${result.message}${preview ? ` — ${preview}` : ""}`);
    }

    setPage(1);
    await fetchStudents({
      classId: "",
      section: "",
      academicYearId: "",
      page: 1,
    });
  };

  // Modal handlers
  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData(transformStudentForEdit(student));
    setIsModalOpen(true);
  };

  const handleUpdate = async (enrollmentNo, updateData) => {
    setIsUpdating(true);
    try {
      const result = await updateStudent(enrollmentNo, updateData);

      if (result.success) {
        setUpdateSuccess(true);
        setTimeout(() => {
          setUpdateSuccess(false);
          closeModal();
        }, 2000);
      } else {
        alert(`Failed to update student: ${result.error || "Please try again."}`);
      }
    } catch (error) {
      alert(`Failed to update student: ${error.message || "Please try again."}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (student) => {
    const name = `${student.firstName || ""} ${student.lastName || ""}`.trim();
    const confirmed = window.confirm(
      `Delete ${name || student.enrollmentNo || "this student"}? This cannot be undone.`
    );

    if (!confirmed) return;

    const result = await deleteStudent(student);
    if (!result.success) {
      alert(`Failed to delete student: ${result.error}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setFormData(INITIAL_FORM_DATA);
    setUpdateSuccess(false);
    setIsUpdating(false);
  };

  // Render loading state
  if (loading) {
    return <LoadingSpinner message="Loading students..." />;
  }

  // Render error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={fetchStudents}
        title="Error Loading Students"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <StudentHeader
          totalStudents={total}
          filteredStudents={filteredStudents.length}
        />

        {/* Filters */}
        <StudentFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          availableClasses={filterOptions.classes}
          availableSections={filterOptions.sections}
          availableYears={filterOptions.years}
          clearAllFilters={clearAllFilters}
          clearIndividualFilter={clearIndividualFilter}
          hasActiveFilters={hasActiveFilters}
        />

        {/* CSV Upload Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Bulk Import Students</h2>
            <button
              onClick={() => setShowCSVUpload(!showCSVUpload)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              {showCSVUpload ? 'Hide Upload' : 'Show Upload'}
            </button>
          </div>
          
          {uploadSummary && (
            <p className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {uploadSummary}
            </p>
          )}

          {showCSVUpload && (
            <CSVUpload
              onUpload={handleCSVUpload}
              title="Upload Student Data"
              description="Upload CSV with Class Name (e.g. 8th, KG1, 10th) and Section (A, B, C) — not database ids. Fees are assigned from the class fee structure."
              entityType="students"
              acceptedFileTypes=".csv"
              sampleDownloadUrl="/sample_student_bulk_upload.csv"
              maxFileSize={10}
              showCredentialExport={true}
              credentialData={uploadedCredentials}
            />
          )}
        {uploadedCredentials && uploadedCredentials.length > 0 && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {uploadedCredentials.length} student login credentials generated
                </p>
                <p className="text-xs">You can download them anytime below.</p>
              </div>
              <button
                onClick={downloadCredentialsCsv}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Download Login Credentials
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Table */}
        <StudentTable
          students={filteredStudents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <StudentPagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={STUDENT_PAGE_SIZE}
          onPageChange={handlePageChange}
          loading={loading}
        />

        <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              {searchTerm.trim()
                ? `${filteredStudents.length} match(es) on this page`
                : `Page ${page} of ${totalPages || 1} · ${total} total students`}
            </span>
            <span>Last updated: {new Date().toLocaleDateString("en-IN")}</span>
          </div>
        </div>

        {/* Modal */}
        <StudentModal
          isOpen={isModalOpen}
          selectedStudent={selectedStudent}
          formData={formData}
          setFormData={setFormData}
          onClose={closeModal}
          onUpdate={handleUpdate}
          isUpdating={isUpdating}
          updateSuccess={updateSuccess}
        />
      </div>
    </div>
  );
};

export default Students;
