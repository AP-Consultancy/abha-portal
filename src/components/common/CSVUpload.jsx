import React, { useState } from 'react';
import { ArrowUpTrayIcon, DocumentArrowDownIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const CSVUpload = ({ 
  onUpload, 
  title = "Upload CSV File", 
  description = "Upload a CSV file to import data in bulk",
  acceptedFileTypes = ".csv,.xlsx,.xls",
  maxFileSize = 5, // MB
  uploadEndpoint = "",
  entityType = "data", // e.g., "students", "teachers", "exams", etc.
  showCredentialExport = false, // Show credential export button for students/teachers
  credentialData = null // Login credentials data to export
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    // Validate file type
    const validTypes = acceptedFileTypes.split(',').map(type => type.trim());
    const isValidType = validTypes.some(type => {
      if (type.startsWith('.')) {
        return selectedFile.name.toLowerCase().endsWith(type);
      }
      return selectedFile.type === type;
    });

    if (!isValidType) {
      setUploadStatus({
        type: 'error',
        message: `Invalid file type. Please upload: ${acceptedFileTypes}`
      });
      return;
    }

    // Validate file size
    if (selectedFile.size > maxFileSize * 1024 * 1024) {
      setUploadStatus({
        type: 'error',
        message: `File size too large. Maximum size: ${maxFileSize}MB`
      });
      return;
    }

    setFile(selectedFile);
    setUploadStatus(null);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      if (onUpload) {
        // Use custom upload handler if provided
        await onUpload(formData, file);
        setUploadStatus({
          type: 'success',
          message: `${entityType} uploaded successfully!`
        });
      } else if (uploadEndpoint) {
        // Use default upload endpoint
        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        setUploadStatus({
          type: 'success',
          message: result.message || `${entityType} uploaded successfully!`
        });
      }

      // Clear file after successful upload
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: error.message || `Failed to upload ${entityType}. Please try again.`
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus(null);
  };

  // Export login credentials as CSV
  const exportCredentials = () => {
    if (!credentialData || credentialData.length === 0) return;

    const headers = ['Name', 'Scholar/Enrollment No', 'One-Time Password', 'Login URL'];
    const csvContent = [
      headers.join(','),
      ...credentialData.map(cred => [
        cred.name || '',
        cred.identifier,
        cred.password,
        `${window.location.origin}/login`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_login_credentials.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : file 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your file here, or{' '}
              <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                browse
                <input
                  type="file"
                  className="hidden"
                  accept={acceptedFileTypes}
                  onChange={handleFileSelect}
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: {acceptedFileTypes} (Max: {maxFileSize}MB)
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span>Upload {entityType}</span>
                  </>
                )}
              </button>
              <button
                onClick={removeFile}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <div className={`mt-4 p-3 rounded-lg ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            {uploadStatus.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{uploadStatus.message}</span>
          </div>
          
          {/* Show credential export button for successful uploads */}
          {uploadStatus.type === 'success' && showCredentialExport && credentialData && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <button
                onClick={exportCredentials}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Download Login Credentials</span>
              </button>
              <p className="text-xs text-green-600 mt-1">
                Download CSV with login credentials for all uploaded {entityType}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Instructions:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Ensure your CSV file has the correct column headers</li>
          <li>• All required fields must be filled</li>
          <li>• Dates should be in YYYY-MM-DD format</li>
          <li>• Maximum file size: {maxFileSize}MB</li>
          <li>• Supported formats: {acceptedFileTypes}</li>
        </ul>
      </div>
    </div>
  );
};

export default CSVUpload;
