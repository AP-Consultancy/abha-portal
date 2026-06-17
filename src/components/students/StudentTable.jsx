import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatDate } from "../../utils/studentUtils";

const display = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const STUDENT_COLUMNS = [
  { key: "studentId", label: "Student ID", get: (s) => display(s.studentId || s.id) },
  { key: "studentName", label: "Student Name", get: (s) => display(s.studentName || `${s.firstName} ${s.lastName}`.trim()) },
  { key: "firstName", label: "First Name", get: (s) => display(s.firstName) },
  { key: "lastName", label: "Last Name", get: (s) => display(s.lastName) },
  { key: "scholarNumber", label: "Scholar No", get: (s) => display(s.scholarNumber) },
  { key: "admissionNo", label: "Admission No", get: (s) => display(s.admissionNo || s.enrollmentNo) },
  { key: "rollNo", label: "Roll No", get: (s) => display(s.rollNo) },
  { key: "gender", label: "Gender", get: (s) => display(s.gender) },
  { key: "dob", label: "Date of Birth", get: (s) => (s.dob ? formatDate(s.dob) : "—") },
  { key: "className", label: "Class", get: (s) => display(s.className) },
  { key: "section", label: "Section", get: (s) => display(s.section) },
  { key: "academicYear", label: "Academic Year", get: (s) => display(s.academicYear) },
  { key: "admissionDate", label: "Admission Date", get: (s) => (s.admissionDate ? formatDate(s.admissionDate) : "—") },
  { key: "aadhaarNo", label: "Aadhaar No", get: (s) => display(s.aadhaarNo) },
  { key: "sssmid", label: "SSSMID", get: (s) => display(s.sssmid) },
  { key: "panNo", label: "PAN No", get: (s) => display(s.panNo) },
  { key: "apaarId", label: "APAAR ID", get: (s) => display(s.apaarId) },
  { key: "phone", label: "Contact No", get: (s) => display(s.phone) },
  { key: "alternateContactNo", label: "Alternate Contact", get: (s) => display(s.alternateContactNo) },
  { key: "email", label: "Email", get: (s) => display(s.email) },
  { key: "address", label: "Address", get: (s) => display(s.address?.street || s.address) },
  { key: "city", label: "City", get: (s) => display(s.address?.city) },
  { key: "state", label: "State", get: (s) => display(s.address?.state) },
  { key: "pincode", label: "Pincode", get: (s) => display(s.address?.postalCode) },
  { key: "fatherName", label: "Father Name", get: (s) => display(s.father?.name) },
  { key: "motherName", label: "Mother Name", get: (s) => display(s.mother?.name) },
  { key: "monthlyFee", label: "Monthly Fee", get: (s) => display(s.monthlyFee) },
  { key: "yearlyFee", label: "Yearly Fee", get: (s) => display(s.yearlyFee) },
  { key: "totalPaid", label: "Total Paid", get: (s) => display(s.totalPaid) },
  { key: "remainingFee", label: "Remaining Fee", get: (s) => display(s.remainingFee) },
  { key: "totalPresent", label: "Present Days", get: (s) => display(s.totalPresent) },
  { key: "totalAbsent", label: "Absent Days", get: (s) => display(s.totalAbsent) },
  { key: "attendancePercentage", label: "Attendance %", get: (s) => display(s.attendancePercentage) },
  { key: "lastPaymentDate", label: "Last Payment", get: (s) => (s.lastPaymentDate ? formatDate(s.lastPaymentDate) : "—") },
  { key: "status", label: "Status", get: (s) => display(s.status) },
];

const StudentTable = ({ students, onEdit, onDelete }) => {
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No students found</div>
          <div className="text-gray-400 text-sm">
            Try adjusting your search criteria or filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{students.length}</span> student
          {students.length === 1 ? "" : "s"}. Scroll horizontally to view all fields.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 z-10 bg-blue-600">
                #
              </th>
              {STUDENT_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky right-0 z-10 bg-indigo-600 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student, index) => {
              const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";
              return (
              <tr
                key={student._id || student.id || student.studentId || index}
                className={rowBg}
              >
                <td className={`px-3 py-3 text-gray-500 font-medium sticky left-0 z-[1] ${rowBg} whitespace-nowrap`}>
                  {index + 1}
                </td>
                {STUDENT_COLUMNS.map((col) => {
                  const isWide =
                    col.key === "address" ||
                    col.key === "fatherName" ||
                    col.key === "motherName" ||
                    col.key === "email";
                  return (
                    <td
                      key={col.key}
                      className={
                        isWide
                          ? "px-3 py-3 text-gray-800 whitespace-normal align-top min-w-[10rem] max-w-md"
                          : "px-3 py-3 text-gray-800 whitespace-nowrap align-top"
                      }
                      title={col.get(student)}
                    >
                      {col.get(student)}
                    </td>
                  );
                })}
                <td className={`px-3 py-3 sticky right-0 z-[1] ${rowBg} whitespace-nowrap`}>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(student)}
                      className="inline-flex items-center px-2 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(student)}
                      className="inline-flex items-center px-2 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
