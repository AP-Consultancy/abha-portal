import React from "react";
import { PencilIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { formatDate } from "../../utils/studentUtils";
import Badge from "../common/Badge";

const StudentTable = ({ students, onEdit }) => {
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Class & Section
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Parents
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Transport
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
            {students.map((student, index) => (
              <StudentTableRow
                key={student._id}
                student={student}
                index={index}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StudentTableRow = ({ student, index, onEdit }) => {
  return (
    <tr
      className={`hover:bg-blue-50 transition-colors duration-200 ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50"
      }`}
    >
      {/* Student Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-12 w-12">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              {student.firstName.charAt(0)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {student.firstName} {student.middleName} {student.lastName}
            </div>
            <div className="text-sm text-gray-500">
              Roll No: {student.rollNo} | {student.enrollmentNo}
            </div>
            <div className="text-xs text-gray-400">
              DOB: {formatDate(student.dob)} | {student.academicYear}
            </div>
          </div>
        </div>
      </td>

      {/* Class & Section */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          Class {student.className}
        </div>
        <div className="text-sm text-gray-500">Section {student.section}</div>
      </td>

      {/* Contact */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2 text-sm text-gray-900 mb-1">
          <PhoneIcon className="h-5 w-5 text-blue-500" />
          <span>{student.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
          <EnvelopeIcon className="h-5 w-5 text-blue-500" />
          <span className="truncate max-w-32">{student.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <MapPinIcon className="h-5 w-5 text-blue-500" />
          <span>
            {student.address.city}, {student.address.state}
          </span>
        </div>
      </td>

      {/* Parents */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 mb-1">
          <span className="font-medium">Father:</span> {student.father.name}
        </div>
        <div className="text-sm text-gray-500 mb-1">
          <span className="font-medium">Mother:</span> {student.mother.name}
        </div>
        <div className="text-xs text-gray-400">{student.father.phone}</div>
      </td>

      {/* Transport */}
      <td className="px-6 py-4 whitespace-nowrap">
        {student.transportOpted ? (
          <div>
            <div className="text-sm font-medium text-green-600">
              {student.busRoute}
            </div>
            <div className="text-xs text-gray-500">{student.pickupPoint}</div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">No Transport</span>
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="status" status={student.status}>
          {student.status}
        </Badge>
        {student.medicalConditions && student.medicalConditions.length > 0 && (
          <div className="mt-1">
            <Badge variant="warning" className="inline-flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-yellow-500" />
              {student.medicalConditions[0]}
            </Badge>
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onEdit(student)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <PencilIcon className="h-5 w-5 mr-2" />
          Edit
        </button>
      </td>
    </tr>
  );
};

export default StudentTable;
