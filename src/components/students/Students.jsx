import React, { useState } from "react";
import { useStudents } from "../../hooks/useStudents";
import { useStudentFilters } from "../../hooks/useStudentFilters";
import { transformStudentForEdit } from "../../utils/studentUtils";
import { INITIAL_FORM_DATA, API_BASE_URL, API_ENDPOINTS } from "../../utils/constants";

// Components
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import CSVUpload from "../common/CSVUpload";
import StudentHeader from "./StudentHeader";
import StudentFilters from "./StudentFilters";
import StudentTable from "./StudentTable";
import StudentModal from "./StudentModal";

const Students = () => {
  // Custom hooks
  const {
    students,
    loading,
    error,
    filterOptions,
    fetchStudents,
    updateStudent,
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // CSV Upload state
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [uploadedCredentials, setUploadedCredentials] = useState(null);

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

  // CSV Upload handler
  const handleCSVUpload = async (formData, file) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STUDENT_BULK_UPLOAD}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
          if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
            const preview = errorData.errors.slice(0, 5)
              .map(e => `Row ${e.row}: ${(e.errors || []).join('; ')}`)
              .join(' | ');
            const more = errorData.errors.length > 5 ? ` (+${errorData.errors.length - 5} more)` : '';
            errorMessage = `${errorMessage}${preview ? ` - ${preview}${more}` : ''}`;
          }
        } catch (e) {
          try {
            const text = await response.text();
            if (text) errorMessage = text;
          } catch (_) {}
        }
        throw new Error(errorMessage);
      }

      const result = await response.json().catch(async () => {
        try {
          const text = await response.text();
          return text ? { message: text } : {};
        } catch (_) {
          return {};
        }
      });
      console.log('Upload result:', result);
      
      // If backend processed but all rows failed, surface a clear error to UI
      if (typeof result.successful === 'number' && typeof result.failed === 'number') {
        if (result.successful === 0 && result.failed > 0) {
          const preview = (result.failedStudents || []).slice(0, 5)
            .map((e) => `Row ${e.row}: ${String(e.reason || (e.errors || []).join('; '))}`)
            .join(' | ');
          const more = (result.failedStudents?.length || 0) > 5 
            ? ` (+${result.failedStudents.length - 5} more)` 
            : '';
          throw new Error(`All rows failed (${result.failed}/${result.total}). ${preview}${more}`);
        }
      }
      
      // Store credentials for export if provided
      if (result.credentials && result.credentials.length > 0) {
        setUploadedCredentials(result.credentials);
      }
      
      // Refresh the students list after successful upload
      await fetchStudents();
    } catch (error) {
      console.error('CSV upload error:', error);
      throw error;
    }
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
        alert(`Failed to update student: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to update student. Please try again.");
    } finally {
      setIsUpdating(false);
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
          totalStudents={students.length}
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
          
          {showCSVUpload && (
            <CSVUpload
              onUpload={handleCSVUpload}
              title="Upload Student Data"
              description="Upload a CSV file to import multiple students at once"
              entityType="students"
              acceptedFileTypes=".csv,.xlsx,.xls"
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
        <StudentTable students={filteredStudents} onEdit={handleEdit} />

        {/* Footer */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              Showing {filteredStudents.length} of {students.length} students
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
