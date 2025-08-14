// import { useEffect, useState } from "react";

// import { useNavigate } from "react-router-dom";

// import {
//   AlertCircle,
//   BookOpen,
//   Bus,
//   Calendar,
//   Check,
//   Edit3,
//   Heart,
//   Mail,
//   MapPin,
//   Phone,
//   PlusIcon,
//   Save,
//   Search,
//   User,
//   Users,
//   X,
// } from "lucide-react";

// const Students = () => {
//   const [students, setStudents] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [updateSuccess, setUpdateSuccess] = useState(false);

//   // Filter states
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   const [availableClasses, setAvailableClasses] = useState([]);
//   const [availableSections, setAvailableSections] = useState([]);
//   const [availableYears, setAvailableYears] = useState([]);

//   const navigate = useNavigate();
//   console.log("selectedStudent", selectedStudent);

//   const initialFormData = {
//     firstName: "",
//     middleName: "",
//     lastName: "",
//     gender: "",
//     dob: "",
//     bloodGroup: "",
//     religion: "",
//     caste: "",
//     nationality: "",
//     photoUrl: "",
//     className: "",
//     section: "",
//     academicYear: "",
//     admissionDate: "",
//     rollNo: "",
//     phone: "",
//     email: "",
//     address: {
//       street: "",
//       city: "",
//       state: "",
//       postalCode: "",
//       country: "",
//     },
//     father: {
//       name: "",
//       phone: "",
//       email: "",
//       relation: "Father",
//     },
//     mother: {
//       name: "",
//       phone: "",
//       email: "",
//       relation: "Mother",
//     },
//     guardian: {
//       name: "",
//       phone: "",
//       email: "",
//       relation: "",
//     },
//     transportOpted: false,
//     busRoute: "",
//     pickupPoint: "",
//     medicalConditions: "",
//     status: "Active",
//     createdBy: "",
//     remarks: "",
//   };

//   const [formData, setFormData] = useState(initialFormData);

//   const labelClasses = "block text-sm font-medium text-gray-700 mb-2";
//   const inputClasses =
//     "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm";

//   // Extract unique values for filters
//   const extractFilterOptions = (studentsData) => {
//     const classes = [
//       ...new Set(studentsData.map((student) => student.className)),
//     ]
//       .filter(Boolean)
//       .sort();
//     const sections = [
//       ...new Set(studentsData.map((student) => student.section)),
//     ]
//       .filter(Boolean)
//       .sort();
//     const years = [
//       ...new Set(studentsData.map((student) => student.academicYear)),
//     ]
//       .filter(Boolean)
//       .sort();

//     setAvailableClasses(classes);
//     setAvailableSections(sections);
//     setAvailableYears(years);
//   };

//   const getAllStudents = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(
//         "http://localhost:5000/api/student/getallstudents",
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Network request was not OK");
//       }
//       const data = await response.json();
//       setStudents(data.students);
//       setFilteredStudents(data.students);
//       extractFilterOptions(data.students);
//     } catch (error) {
//       console.error("Error fetching all students:", error);
//       setError("Failed to load students. Please check your server connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getAllStudents();
//   }, []);

//   // Enhanced filtering effect with class, section, year, and search
//   useEffect(() => {
//     let filtered = students;

//     // Apply class filter
//     if (selectedClass) {
//       filtered = filtered.filter(
//         (student) => student.className === selectedClass
//       );
//     }

//     // Apply section filter
//     if (selectedSection) {
//       filtered = filtered.filter(
//         (student) => student.section === selectedSection
//       );
//     }

//     // Apply year filter
//     if (selectedYear) {
//       filtered = filtered.filter(
//         (student) => student.academicYear === selectedYear
//       );
//     }

//     // Apply search filter
//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter(
//         (student) =>
//           student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           student.enrollmentNo
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           student.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           student.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           student.phone.includes(searchTerm)
//       );
//     }

//     setFilteredStudents(filtered);
//   }, [searchTerm, students, selectedClass, selectedSection, selectedYear]);

//   // Clear all filters
//   const clearAllFilters = () => {
//     setSelectedClass("");
//     setSelectedSection("");
//     setSelectedYear("");
//     setSearchTerm("");
//   };

//   const handleEdit = (student) => {
//     setSelectedStudent(student);
//     setFormData({
//       firstName: student.firstName || "",
//       middleName: student.middleName || "",
//       lastName: student.lastName || "",
//       gender: student.gender || "",
//       dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
//       bloodGroup: student.bloodGroup || "",
//       religion: student.religion || "",
//       caste: student.caste || "",
//       nationality: student.nationality || "",
//       photoUrl: student.photoUrl || "",
//       className: student.className || "",
//       section: student.section || "",
//       academicYear: student.academicYear || "",
//       admissionDate: student.admissionDate
//         ? new Date(student.admissionDate).toISOString().split("T")[0]
//         : "",
//       rollNo: student.rollNo || "",
//       phone: student.phone || "",
//       email: student.email || "",
//       address: {
//         street: student.address?.street || "",
//         city: student.address?.city || "",
//         state: student.address?.state || "",
//         postalCode: student.address?.postalCode || "",
//         country: student.address?.country || "",
//       },
//       father: {
//         name: student.father?.name || "",
//         phone: student.father?.phone || "",
//         email: student.father?.email || "",
//         relation: "Father",
//       },
//       mother: {
//         name: student.mother?.name || "",
//         phone: student.mother?.phone || "",
//         email: student.mother?.email || "",
//         relation: "Mother",
//       },
//       guardian: {
//         name: student.guardian?.name || "",
//         phone: student.guardian?.phone || "",
//         email: student.guardian?.email || "",
//         relation: student.guardian?.relation || "",
//       },
//       transportOpted: student.transportOpted || false,
//       busRoute: student.busRoute || "",
//       pickupPoint: student.pickupPoint || "",
//       medicalConditions: student.medicalConditions?.join(", ") || "",
//       status: student.status || "Active",
//       createdBy: student.createdBy || "",
//       remarks: student.remarks || "",
//     });
//     setIsModalOpen(true);
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type } = e.target;

//     if (type === "checkbox") {
//       const checked = e.target.checked;
//       setFormData((prev) => ({
//         ...prev,
//         [name]: checked,
//       }));
//     } else if (name.includes(".")) {
//       const [parent, child] = name.split(".");
//       setFormData((prev) => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value,
//         },
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   const handleUpdate = async () => {
//     if (!selectedStudent) return;
//     console.log(selectedStudent, "selected student");
//     try {
//       setIsUpdating(true);
//       const updateData = {
//         ...formData,
//         medicalConditions: formData.medicalConditions
//           .split(",")
//           .map((condition) => condition.trim())
//           .filter(Boolean),

//         // Hardcode relation fields
//         father: {
//           ...formData.father,
//           relation: "Father",
//         },
//         mother: {
//           ...formData.mother,
//           relation: "Mother",
//         },
//       };

//       console.log("Update Data:", updateData);
//       const response = await fetch(
//         `http://localhost:5000/api/student/update-student/${selectedStudent.enrollmentNo}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(updateData),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to update student");
//       }

//       setUpdateSuccess(true);
//       setTimeout(() => {
//         setUpdateSuccess(false);
//         setIsModalOpen(false);
//         getAllStudents(); // Refresh the data
//       }, 2000);
//     } catch (error) {
//       console.error("Error updating student:", error);
//       alert("Failed to update student. Please try again.");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedStudent(null);
//     setFormData(initialFormData);
//     setUpdateSuccess(false);
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-IN", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const getStatusBadge = (status) => {
//     const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
//     if (status === "Active") {
//       return `${baseClasses} bg-green-100 text-green-800`;
//     }
//     return `${baseClasses} bg-gray-100 text-gray-800`;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <div className="flex items-center space-x-2 text-red-600 mb-2">
//             <AlertCircle size={20} />
//             <h3 className="font-semibold">Error Loading Students</h3>
//           </div>
//           <p className="text-red-700">{error}</p>
//           <button
//             onClick={getAllStudents}
//             className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
//                 <Edit3 className="text-blue-600" size={32} />
//                 Students Management
//               </h1>
//               <p className="text-gray-600 mt-2">
//                 Total Students:{" "}
//                 <span className="font-semibold text-blue-600">
//                   {students.length}
//                 </span>{" "}
//                 | Filtered:{" "}
//                 <span className="font-semibold text-green-600">
//                   {filteredStudents.length}
//                 </span>
//               </p>
//             </div>
//             <div className="text-right">
//               <p className="text-sm text-gray-500">Academic Year</p>
//               <p className="text-lg font-semibold text-gray-900">2024-2025</p>
//             </div>
//             <div className="flex justify-between items-center">
//               <button
//                 onClick={() => {
//                   navigate("/add-student");
//                 }}
//                 className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
//               >
//                 <PlusIcon className="h-5 w-5" />
//                 <span>Add Student</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced Filter Section */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//             {/* Class Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Filter by Class
//               </label>
//               <select
//                 value={selectedClass}
//                 onChange={(e) => setSelectedClass(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Classes</option>
//                 {availableClasses.map((className) => (
//                   <option key={className} value={className}>
//                     Class {className}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Section Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Filter by Section
//               </label>
//               <select
//                 value={selectedSection}
//                 onChange={(e) => setSelectedSection(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Sections</option>
//                 {availableSections.map((section) => (
//                   <option key={section} value={section}>
//                     Section {section}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Academic Year Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Filter by Academic Year
//               </label>
//               <select
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Years</option>
//                 {availableYears.map((year) => (
//                   <option key={year} value={year}>
//                     {year}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Clear Filters Button */}
//             <div className="flex items-end">
//               <button
//                 onClick={clearAllFilters}
//                 className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
//               >
//                 <X size={16} />
//                 <span>Clear Filters</span>
//               </button>
//             </div>
//           </div>

//           {/* Active Filters Display */}
//           {(selectedClass || selectedSection || selectedYear) && (
//             <div className="flex flex-wrap gap-2 mb-4">
//               <span className="text-sm text-gray-600">Active Filters:</span>
//               {selectedClass && (
//                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                   Class: {selectedClass}
//                   <button
//                     onClick={() => setSelectedClass("")}
//                     className="ml-2 text-blue-600 hover:text-blue-800"
//                   >
//                     <X size={12} />
//                   </button>
//                 </span>
//               )}
//               {selectedSection && (
//                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                   Section: {selectedSection}
//                   <button
//                     onClick={() => setSelectedSection("")}
//                     className="ml-2 text-green-600 hover:text-green-800"
//                   >
//                     <X size={12} />
//                   </button>
//                 </span>
//               )}
//               {selectedYear && (
//                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                   Year: {selectedYear}
//                   <button
//                     onClick={() => setSelectedYear("")}
//                     className="ml-2 text-purple-600 hover:text-purple-800"
//                   >
//                     <X size={12} />
//                   </button>
//                 </span>
//               )}
//             </div>
//           )}

//           {/* Search Bar */}
//           <div className="relative">
//             <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search students by name, roll number, enrollment number, class, section, email, or phone..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//             />
//           </div>
//         </div>

//         {/* Table Container */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
//                     Student
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
//                     Class & Section
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
//                     Contact
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
//                     Parents
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
//                     Transport
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredStudents?.map((student, index) => (
//                   <tr
//                     key={student._id}
//                     className={`hover:bg-blue-50 transition-colors duration-200 ${
//                       index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                     }`}
//                   >
//                     {/* Student Info */}
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center space-x-3">
//                         <div className="flex-shrink-0 h-12 w-12">
//                           <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
//                             {student.firstName.charAt(0)}
//                           </div>
//                         </div>
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">
//                             {student.firstName} {student.middleName}{" "}
//                             {student.lastName}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             Roll No: {student.rollNo} | {student.enrollmentNo}
//                           </div>
//                           <div className="text-xs text-gray-400">
//                             DOB: {formatDate(student.dob)} |{" "}
//                             {student.academicYear}
//                           </div>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Class & Section */}
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">
//                         Class {student.className}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         Section {student.section}
//                       </div>
//                     </td>

//                     {/* Contact */}
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center space-x-2 text-sm text-gray-900 mb-1">
//                         <Phone size={14} className="text-blue-500" />
//                         <span>{student.phone}</span>
//                       </div>
//                       <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
//                         <Mail size={14} className="text-blue-500" />
//                         <span className="truncate max-w-32">
//                           {student.email}
//                         </span>
//                       </div>
//                       <div className="flex items-center space-x-2 text-xs text-gray-400">
//                         <MapPin size={12} className="text-blue-500" />
//                         <span>
//                           {student.address.city}, {student.address.state}
//                         </span>
//                       </div>
//                     </td>

//                     {/* Parents */}
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900 mb-1">
//                         <span className="font-medium">Father:</span>{" "}
//                         {student.father.name}
//                       </div>
//                       <div className="text-sm text-gray-500 mb-1">
//                         <span className="font-medium">Mother:</span>{" "}
//                         {student.mother.name}
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         {student.father.phone}
//                       </div>
//                     </td>

//                     {/* Transport */}
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {student.transportOpted ? (
//                         <div>
//                           <div className="text-sm font-medium text-green-600">
//                             {student.busRoute}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {student.pickupPoint}
//                           </div>
//                         </div>
//                       ) : (
//                         <span className="text-sm text-gray-400">
//                           No Transport
//                         </span>
//                       )}
//                     </td>

//                     {/* Status */}
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={getStatusBadge(student.status)}>
//                         {student.status}
//                       </span>
//                       {student.medicalConditions &&
//                         student.medicalConditions.length > 0 && (
//                           <div className="mt-1">
//                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
//                               <AlertCircle size={12} className="mr-1" />
//                               {student.medicalConditions[0]}
//                             </span>
//                           </div>
//                         )}
//                     </td>

//                     {/* Actions */}
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <button
//                         onClick={() => handleEdit(student)}
//                         className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
//                       >
//                         <Edit3 size={16} className="mr-2" />
//                         Edit
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* No Results Message */}
//           {filteredStudents.length === 0 && (
//             <div className="text-center py-12">
//               <div className="text-gray-500 text-lg mb-2">
//                 No students found
//               </div>
//               <div className="text-gray-400 text-sm">
//                 Try adjusting your search criteria or filters
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
//           <div className="flex justify-between items-center text-sm text-gray-500">
//             <span>
//               Showing {filteredStudents.length} of {students.length} students
//             </span>
//             <span>Last updated: {new Date().toLocaleDateString("en-IN")}</span>
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
//               <h2 className="text-2xl font-bold text-gray-900">
//                 Update Student: {selectedStudent?.firstName}{" "}
//                 {selectedStudent?.lastName}
//               </h2>
//               <button
//                 onClick={closeModal}
//                 className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="p-6">
//               <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
//                 <div className="p-8">
//                   <div className="space-y-8">
//                     {/* Basic Information Section */}
//                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
//                       <div className="flex items-center mb-6">
//                         <User className="w-5 h-5 text-blue-600 mr-2" />
//                         <h2 className="text-xl font-semibold text-gray-900">
//                           Basic Information
//                         </h2>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <div>
//                           <label className={labelClasses}>First Name *</label>
//                           <input
//                             type="text"
//                             name="firstName"
//                             value={formData.firstName}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="Enter first name"
//                             required
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Middle Name</label>
//                           <input
//                             type="text"
//                             name="middleName"
//                             value={formData.middleName}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="Enter middle name"
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Last Name *</label>
//                           <input
//                             type="text"
//                             name="lastName"
//                             value={formData.lastName}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="Enter last name"
//                             required
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Gender *</label>
//                           <select
//                             name="gender"
//                             value={formData.gender}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             required
//                           >
//                             <option value="">Select gender</option>
//                             <option value="Male">Male</option>
//                             <option value="Female">Female</option>
//                             <option value="Other">Other</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className={labelClasses}>
//                             Date of Birth *
//                           </label>
//                           <div className="relative">
//                             <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//                             <input
//                               type="date"
//                               name="dob"
//                               value={formData.dob}
//                               onChange={handleInputChange}
//                               className={`${inputClasses} pl-12`}
//                               required
//                             />
//                           </div>
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Blood Group</label>
//                           <select
//                             name="bloodGroup"
//                             value={formData.bloodGroup}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                           >
//                             <option value="">Select blood group</option>
//                             <option value="A+">A+</option>
//                             <option value="A-">A-</option>
//                             <option value="B+">B+</option>
//                             <option value="B-">B-</option>
//                             <option value="AB+">AB+</option>
//                             <option value="AB-">AB-</option>
//                             <option value="O+">O+</option>
//                             <option value="O-">O-</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Religion</label>
//                           <input
//                             type="text"
//                             name="religion"
//                             value={formData.religion}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="Enter religion"
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Caste</label>
//                           <input
//                             type="text"
//                             name="caste"
//                             value={formData.caste}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="Enter caste"
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Nationality</label>
//                           <input
//                             type="text"
//                             name="nationality"
//                             value={formData.nationality}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="Indian"
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Photo URL</label>
//                           <input
//                             type="url"
//                             name="photoUrl"
//                             value={formData.photoUrl}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="https://example.com/photo.jpg"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Academic Information Section */}
//                     <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
//                       <div className="flex items-center mb-6">
//                         <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
//                         <h2 className="text-xl font-semibold text-gray-900">
//                           Academic Information
//                         </h2>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <div>
//                           <label className={labelClasses}>Class Name *</label>
//                           <input
//                             type="text"
//                             name="className"
//                             value={formData.className}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="10th Grade"
//                             required
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Section *</label>
//                           <select
//                             name="section"
//                             value={formData.section}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             required
//                           >
//                             <option value="">Select section</option>
//                             <option value="A">A</option>
//                             <option value="B">B</option>
//                             <option value="C">C</option>
//                             <option value="D">D</option>
//                             <option value="E">E</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className={labelClasses}>
//                             Academic Year *
//                           </label>
//                           <input
//                             type="text"
//                             name="academicYear"
//                             value={formData.academicYear}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="2024-2025"
//                             required
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>
//                             Admission Date *
//                           </label>
//                           <input
//                             type="date"
//                             name="admissionDate"
//                             value={formData.admissionDate}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             required
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Roll No</label>
//                           <input
//                             type="text"
//                             name="rollNo"
//                             value={formData.rollNo}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="001"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Contact Information Section */}
//                     <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
//                       <div className="flex items-center mb-6">
//                         <Phone className="w-5 h-5 text-green-600 mr-2" />
//                         <h2 className="text-xl font-semibold text-gray-900">
//                           Contact Information
//                         </h2>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                         <div>
//                           <label className={labelClasses}>Phone Number</label>
//                           <input
//                             type="tel"
//                             name="phone"
//                             value={formData.phone}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="+91 98765 43210"
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Email Address</label>
//                           <div className="relative">
//                             <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//                             <input
//                               type="email"
//                               name="email"
//                               value={formData.email}
//                               onChange={handleInputChange}
//                               className={`${inputClasses} pl-12`}
//                               placeholder="student@example.com"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div className="border-t pt-6">
//                         <div className="flex items-center mb-4">
//                           <MapPin className="w-5 h-5 text-green-600 mr-2" />
//                           <h3 className="text-lg font-medium text-gray-900">
//                             Address
//                           </h3>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div className="md:col-span-2">
//                             <label className={labelClasses}>
//                               Street Address
//                             </label>
//                             <input
//                               type="text"
//                               name="address.street"
//                               value={formData.address.street}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="123 Main Street"
//                             />
//                           </div>

//                           <div>
//                             <label className={labelClasses}>City</label>
//                             <input
//                               type="text"
//                               name="address.city"
//                               value={formData.address.city}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="Mumbai"
//                             />
//                           </div>

//                           <div>
//                             <label className={labelClasses}>State</label>
//                             <input
//                               type="text"
//                               name="address.state"
//                               value={formData.address.state}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="Maharashtra"
//                             />
//                           </div>

//                           <div>
//                             <label className={labelClasses}>Postal Code</label>
//                             <input
//                               type="text"
//                               name="address.postalCode"
//                               value={formData.address.postalCode}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="400001"
//                             />
//                           </div>

//                           <div>
//                             <label className={labelClasses}>Country</label>
//                             <input
//                               type="text"
//                               name="address.country"
//                               value={formData.address.country}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="India"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Parent/Guardian Information Section */}
//                     <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
//                       <div className="flex items-center mb-6">
//                         <Users className="w-5 h-5 text-yellow-600 mr-2" />
//                         <h2 className="text-xl font-semibold text-gray-900">
//                           Parent/Guardian Information
//                         </h2>
//                       </div>

//                       {/* Father Info */}
//                       <div className="mb-8">
//                         <h3 className="text-lg font-medium text-gray-900 mb-4">
//                           Father's Information *
//                         </h3>
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                           <div>
//                             <label className={labelClasses}>
//                               Father's Name *
//                             </label>
//                             <input
//                               type="text"
//                               name="father.name"
//                               value={formData.father.name}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="Enter father's name"
//                               required
//                             />
//                           </div>

//                           <div>
//                             <label className={labelClasses}>
//                               Father's Phone *
//                             </label>
//                             <input
//                               type="tel"
//                               name="father.phone"
//                               value={formData.father.phone}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="+91 98765 43210"
//                               required
//                             />
//                           </div>

//                           <div>
//                             <label className={labelClasses}>
//                               Father's Email
//                             </label>
//                             <input
//                               type="email"
//                               name="father.email"
//                               value={formData.father.email}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="father@example.com"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       {/* Mother Info */}
//                       <div className="mb-8">
//                         <h3 className="text-lg font-medium text-gray-900 mb-4">
//                           Mother's Information *
//                         </h3>
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                           <div>
//                             <label className={labelClasses}>
//                               Mother's Name *
//                             </label>
//                             <input
//                               type="text"
//                               name="mother.name"
//                               value={formData.mother.name}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="Enter mother's name"
//                               required
//                             />
//                           </div>

//                           <div>
//                             <label className={labelClasses}>
//                               Mother's Phone *
//                             </label>
//                             <input
//                               type="tel"
//                               name="mother.phone"
//                               value={formData.mother.phone}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="+91 98765 43210"
//                               required
//                             />
//                           </div>

//                           <div>
//                             <label className={labelClasses}>
//                               Mother's Email
//                             </label>
//                             <input
//                               type="email"
//                               name="mother.email"
//                               value={formData.mother.email}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="mother@example.com"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       {/* Guardian Info */}
//                       <div>
//                         <h3 className="text-lg font-medium text-gray-900 mb-4">
//                           Guardian Information (Optional)
//                         </h3>
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                           <div>
//                             <label className={labelClasses}>
//                               Guardian's Name
//                             </label>
//                             <input
//                               type="text"
//                               name="guardian.name"
//                               value={formData.guardian.name}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="Enter guardian's name"
//                             />
//                           </div>

//                           <div>
//                             <label className={labelClasses}>
//                               Guardian's Phone
//                             </label>
//                             <input
//                               type="tel"
//                               name="guardian.phone"
//                               value={formData.guardian.phone}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="+91 98765 43210"
//                             />
//                           </div>

//                           <div>
//                             <label className={labelClasses}>
//                               Guardian's Email
//                             </label>
//                             <input
//                               type="email"
//                               name="guardian.email"
//                               value={formData.guardian.email}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="guardian@example.com"
//                             />
//                           </div>

//                           <div>
//                             <label className={labelClasses}>Relation</label>
//                             <input
//                               type="text"
//                               name="guardian.relation"
//                               value={formData.guardian.relation}
//                               onChange={handleInputChange}
//                               className={inputClasses}
//                               placeholder="Uncle, Aunt, etc."
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Transport Information Section */}
//                     <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6">
//                       <div className="flex items-center mb-6">
//                         <Bus className="w-5 h-5 text-cyan-600 mr-2" />
//                         <h2 className="text-xl font-semibold text-gray-900">
//                           Transport Information
//                         </h2>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <div className="flex items-center">
//                           <input
//                             type="checkbox"
//                             name="transportOpted"
//                             checked={formData.transportOpted}
//                             onChange={handleInputChange}
//                             className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                           />
//                           <label className="ml-2 text-sm font-medium text-gray-700">
//                             Transport Opted
//                           </label>
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Bus Route</label>
//                           <input
//                             type="text"
//                             name="busRoute"
//                             value={formData.busRoute}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="Route 1"
//                             disabled={!formData.transportOpted}
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Pickup Point</label>
//                           <input
//                             type="text"
//                             name="pickupPoint"
//                             value={formData.pickupPoint}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="Main Gate"
//                             disabled={!formData.transportOpted}
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Health & Administrative Section */}
//                     <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
//                       <div className="flex items-center mb-6">
//                         <Heart className="w-5 h-5 text-red-600 mr-2" />
//                         <h2 className="text-xl font-semibold text-gray-900">
//                           Health & Administrative Information
//                         </h2>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <label className={labelClasses}>
//                             Medical Conditions
//                           </label>
//                           <input
//                             type="text"
//                             name="medicalConditions"
//                             value={formData.medicalConditions}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="Asthma, Allergy (comma separated)"
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Status</label>
//                           <select
//                             name="status"
//                             value={formData.status}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                           >
//                             <option value="Active">Active</option>
//                             <option value="Inactive">Inactive</option>
//                             <option value="Transfered">Transferred</option>
//                             <option value="Graduated">Graduated</option>
//                             <option value="Dropped">Dropped</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Created By</label>
//                           <input
//                             type="text"
//                             name="createdBy"
//                             value={formData.createdBy}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="Admin name"
//                           />
//                         </div>

//                         <div>
//                           <label className={labelClasses}>Remarks</label>
//                           <textarea
//                             name="remarks"
//                             value={formData.remarks}
//                             onChange={handleInputChange}
//                             className={inputClasses}
//                             placeholder="Any additional remarks"
//                             rows={3}
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="flex justify-center space-x-4 pt-6">
//                       <button
//                         type="button"
//                         onClick={closeModal}
//                         className="px-8 py-4 rounded-xl font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="button"
//                         onClick={handleUpdate}
//                         className={`
//                           px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center space-x-2
//                           ${
//                             updateSuccess
//                               ? "bg-green-500 hover:bg-green-600"
//                               : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
//                           }
//                           shadow-lg hover:shadow-xl
//                         `}
//                         disabled={isUpdating || updateSuccess}
//                       >
//                         {updateSuccess ? (
//                           <>
//                             <Check className="w-5 h-5" />
//                             <span>Student Updated Successfully!</span>
//                           </>
//                         ) : isUpdating ? (
//                           <>
//                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                             <span>Updating...</span>
//                           </>
//                         ) : (
//                           <>
//                             <Save className="w-5 h-5" />
//                             <span>Update Student</span>
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Students;

import React from "react";
import Student from "../components/students/Students";
const Students = () => {
  return (
    <>
      <Student />
    </>
  );
};
export default Students;
