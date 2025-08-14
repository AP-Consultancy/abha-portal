// import React, { useState } from 'react';
// import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// const Employees = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('all');
//   const [showAddModal, setShowAddModal] = useState(false);

//   const employees = [
//     {
//       id: 1,
//       name: 'Dr. Jane Smith',
//       employeeId: 'EMP001',
//       department: 'Mathematics',
//       position: 'Head of Department',
//       email: 'jane.smith@school.com',
//       phone: '+1 234 567 8900',
//       joinDate: '2018-08-15',
//       salary: '$5,500',
//       status: 'Active',
//       qualification: 'Ph.D. in Mathematics'
//     },
//     {
//       id: 2,
//       name: 'Mr. Robert Johnson',
//       employeeId: 'EMP002',
//       department: 'Science',
//       position: 'Physics Teacher',
//       email: 'robert.johnson@school.com',
//       phone: '+1 234 567 8901',
//       joinDate: '2019-01-10',
//       salary: '$4,800',
//       status: 'Active',
//       qualification: 'M.Sc. in Physics'
//     },
//     {
//       id: 3,
//       name: 'Ms. Sarah Wilson',
//       employeeId: 'EMP003',
//       department: 'English',
//       position: 'English Teacher',
//       email: 'sarah.wilson@school.com',
//       phone: '+1 234 567 8902',
//       joinDate: '2020-03-20',
//       salary: '$4,500',
//       status: 'Active',
//       qualification: 'M.A. in English Literature'
//     }
//   ];

//   const departments = ['all', 'Mathematics', 'Science', 'English', 'Social Studies', 'Arts', 'Physical Education', 'Administration'];

//   const filteredEmployees = employees.filter(employee => {
//     const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
//     return matchesSearch && matchesDepartment;
//   });

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
//         >
//           <PlusIcon className="h-5 w-5" />
//           <span>Add Employee</span>
//         </button>
//       </div>

//       {/* Search and Filters */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
//           <div className="relative flex-1 max-w-md">
//             <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search employees..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2">
//               <FunnelIcon className="h-5 w-5 text-gray-400" />
//               <select
//                 value={selectedDepartment}
//                 onChange={(e) => setSelectedDepartment(e.target.value)}
//                 className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 {departments.map(dept => (
//                   <option key={dept} value={dept}>
//                     {dept === 'all' ? 'All Departments' : dept}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Employee Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Employees</p>
//               <p className="text-2xl font-bold text-gray-900">89</p>
//             </div>
//             <div className="bg-blue-100 p-3 rounded-lg">
//               <span className="text-blue-600 font-semibold">👥</span>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Teaching Staff</p>
//               <p className="text-2xl font-bold text-gray-900">65</p>
//             </div>
//             <div className="bg-green-100 p-3 rounded-lg">
//               <span className="text-green-600 font-semibold">📚</span>
//             </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Administrative</p>
//               <p className="text-2xl font-bold text-gray-900">24</p>
//             </div>
//             <div className="bg-purple-100 p-3 rounded-lg">
//               <span className="text-purple-600 font-semibold">🏢</span>
//             </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Present Today</p>
//               <p className="text-2xl font-bold text-gray-900">84</p>
//             </div>
//             <div className="bg-yellow-100 p-3 rounded-lg">
//               <span className="text-yellow-600 font-semibold">✅</span>
//             </div>
//         </div>
//       </div>

//       {/* Employees Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredEmployees.map((employee) => (
//                 <tr key={employee.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="flex-shrink-0 h-10 w-10">
//                         <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
//                           <span className="text-sm font-medium text-gray-700">
//                             {employee.name.split(' ').map(n => n[0]).join('')}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-gray-900">{employee.name}</div>
//                         <div className="text-sm text-gray-500">{employee.email}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.employeeId}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.department}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.position}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.salary}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
//                       {employee.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-2">
//                       <button className="text-blue-600 hover:text-blue-900">
//                         <EyeIcon className="h-5 w-5" />
//                       </button>
//                       <button className="text-green-600 hover:text-green-900">
//                         <PencilIcon className="h-5 w-5" />
//                       </button>
//                       <button className="text-red-600 hover:text-red-900">
//                         <TrashIcon className="h-5 w-5" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add Employee Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
//             <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//               <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Employee</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//                     <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
//                     <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
//                     <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
//                       {departments.filter(dept => dept !== 'all').map(dept => (
//                         <option key={dept} value={dept}>{dept}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
//                     <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                     <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
//                     <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//                 <button
//                   onClick={() => setShowAddModal(false)}
//                   className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
//                 >
//                   Add Employee
//                 </button>
//                 <button
//                   onClick={() => setShowAddModal(false)}
//                   className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Employees;

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { teacherService } from "../services/teacherService";
import CSVUpload from "../components/common/CSVUpload";
import { API_BASE_URL } from "../utils/constants";

import {
  ExclamationTriangleIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  PencilIcon,
  HeartIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  UsersIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

const Teachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
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
  };

  const [formData, setFormData] = useState(initialFormData);

  const getAllTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data.teachers || []);
      setFilteredTeachers(data.teachers || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  // CSV Upload handler
  const handleCSVUpload = async (formData, file) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/teachers/bulk-upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch (e) {
          const text = await response.text().catch(() => '');
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json().catch(async () => {
        const text = await response.text().catch(() => '');
        return text ? { message: text } : {};
      });
      console.log('Upload result:', result);
      
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
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTeachers(teachers);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = teachers.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(lower) ||
          teacher.email.toLowerCase().includes(lower) ||
          teacher.contact.includes(lower) ||
          teacher.enrollmentNo?.toLowerCase().includes(lower)
      );
      setFilteredTeachers(filtered);
    }
  }, [searchTerm, teachers]);

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      // enrollmentNo: teacher.enrollmentNo || "",
      name: teacher.name || "",
      email: teacher.email || "",
      contact: teacher.contact || "",
      alternateContact: teacher.alternateContact || "",
      gender: teacher.gender || "",
      dob: teacher.dob ? teacher.dob.split("T")[0] : "",
      address: {
        street: teacher.address?.street || "",
        city: teacher.address?.city || "",
        state: teacher.address?.state || "",
        zip: teacher.address?.zip || "",
        country: teacher.address?.country || "",
      },
      designation: teacher.designation || "",
      department: teacher.department || "",
      joiningDate: teacher.joiningDate ? teacher.joiningDate.split("T")[0] : "",
      status: teacher.status || "Active",
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdate = async () => {
    if (!selectedTeacher) return;
    setIsUpdating(true);
    try {
      await teacherService.updateTeacher(selectedTeacher.enrollmentNo, formData);

      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        setIsModalOpen(false);
        getAllTeachers();
      }, 2000);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update teacher.");
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
    setFormData(initialFormData);
    setUpdateSuccess(false);
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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
      <div className="max-w-6xl mx-auto">
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
              <p className="text-lg font-semibold text-gray-900">2024-2025</p>
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
              placeholder="Search Teachers by name, roll number, enrollment number, class, section, email, or phone..."
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
              acceptedFileTypes=".csv,.xlsx,.xls"
              maxFileSize={10}
              showCredentialExport={true}
              credentialData={uploadedCredentials}
            />
          )}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeachers?.map((teacher, index) => (
                  <tr
                    key={teacher._id}
                    className={`hover:bg-blue-50 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {/* Teacher Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                            {teacher.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Enrollment No: {teacher.enrollmentNo}
                          </div>
                          <div className="text-xs text-gray-400">
                            DOB: {formatDate(teacher.dob)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="mb-1 flex items-center space-x-2">
                        <PhoneIcon className="h-4 w-4 text-blue-500" />
                        <span>{teacher.contact}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <EnvelopeIcon className="h-4 w-4 text-blue-500" />
                        <span className="truncate max-w-32">
                          {teacher.email}
                        </span>
                      </div>
                      {teacher.alternateContact && (
                        <div className="text-xs text-gray-400 mt-1">
                          Alt: {teacher.alternateContact}
                        </div>
                      )}
                    </td>

                    {/* Address */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div>
                        {teacher.address?.street && (
                          <div>{teacher.address.street}</div>
                        )}
                        <div>
                          {teacher.address?.city}, {teacher.address?.state}
                        </div>
                        <div>{teacher.address?.country}</div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-medium">{teacher.department}</div>
                      <div className="text-gray-500">{teacher.designation}</div>
                      {teacher.joiningDate && (
                        <div className="text-xs text-gray-400 mt-1">
                          Joined: {formatDate(teacher.joiningDate)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 text-sm rounded-full ${
                          teacher.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : teacher.status === "Inactive"
                            ? "bg-gray-200 text-gray-700"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {teacher.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              Showing {filteredTeachers.length} of {teachers.length} students
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
                Update Teacher: {selectedTeacher?.firstName}{" "}
                {selectedTeacher?.lastName}
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
              {/* Basic Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClasses}> Name *</label>
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
                    <label className={labelClasses}>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={inputClasses}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-2 text-green-600" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Contact Number</label>
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>
                      Alternate Contact Number
                    </label>
                    <input
                      type="tel"
                      name="alternateContact"
                      value={formData.alternateContact || ""}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="mt-6 border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2 text-green-600" />
                    Address
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["street", "city", "state", "postalCode"].map((field) => (
                      <div key={field}>
                        <label className={labelClasses}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <input
                          type="text"
                          name={`address.${field}`}
                          value={formData.address?.[field] || ""}
                          onChange={handleInputChange}
                          className={inputClasses}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <BriefcaseIcon className="w-6 h-6 mr-2 text-purple-600" />
                  Professional Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Designation *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        className={`${inputClasses} pl-10`}
                        placeholder="e.g., Lecturer"
                      />
                    </div>
                    {/* {errors.designation && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.designation}
                      </p>
                    )} */}
                  </div>

                  <div>
                    <label className={labelClasses}>Department *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className={`${inputClasses} pl-10`}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    {/* {errors.department && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.department}
                      </p>
                    )} */}
                  </div>

                  <div>
                    <label className={labelClasses}>Joining Date *</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleInputChange}
                        className={`${inputClasses} pl-10`}
                      />
                    </div>
                    {/* {errors.joiningDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.joiningDate}
                      </p>
                    )} */}
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
                      <ArrowDownTrayIcon className="w-5 h-5" />
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
