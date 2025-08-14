import React from "react";
import { useNavigate } from "react-router-dom";
import { PencilIcon, PlusIcon } from "@heroicons/react/24/outline";

const StudentHeader = ({ totalStudents, filteredStudents }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <PencilIcon className="text-blue-600" size={32} />
            Students Management
          </h1>
          <p className="text-gray-600 mt-2">
            Total Students:{" "}
            <span className="font-semibold text-blue-600">{totalStudents}</span>{" "}
            | Filtered:{" "}
            <span className="font-semibold text-green-600">
              {filteredStudents}
            </span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Academic Year</p>
          <p className="text-lg font-semibold text-gray-900">2024-2025</p>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/add-student")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentHeader;
