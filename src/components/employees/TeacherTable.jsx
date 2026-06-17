import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatTeacherDate, formatSalary } from "../../utils/teacherUtils";

const display = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const renderListCell = (value) => {
  const text = display(value);
  if (text === "—") return text;
  const parts = text.split(/;\s*/).filter(Boolean);
  if (parts.length <= 1) {
    const commaParts = text.split(/,\s*/).filter(Boolean);
    if (commaParts.length > 3 && !text.includes(";")) {
      return (
        <ul className="m-0 list-none space-y-0.5 p-0">
          {commaParts.map((part, i) => (
            <li key={i}>{part}</li>
          ))}
        </ul>
      );
    }
    return text;
  }
  return (
    <ul className="m-0 list-none space-y-0.5 p-0">
      {parts.map((part, i) => (
        <li key={i}>{part}</li>
      ))}
    </ul>
  );
};

const TEACHER_COLUMNS = [
  { key: "teacherId", label: "Teacher ID", get: (t) => display(t.teacherId || t.id) },
  { key: "employeeId", label: "Employee ID", get: (t) => display(t.enrollmentNo || t.employee_id) },
  { key: "firstName", label: "First Name", get: (t) => display(t.firstName || t.name?.split?.(" ")?.[0]) },
  { key: "lastName", label: "Last Name", get: (t) => display(t.lastName || t.name?.split?.(" ")?.slice(1)?.join(" ")) },
  { key: "email", label: "Email", get: (t) => display(t.email), wide: true },
  { key: "phone", label: "Contact", get: (t) => display(t.contact || t.phone) },
  { key: "qualification", label: "Qualification", get: (t) => display(t.qualification || t.department) },
  { key: "specialization", label: "Specialization", get: (t) => display(t.specialization || t.designation) },
  {
    key: "joiningDate",
    label: "Joining Date",
    get: (t) => (t.joiningDate ? formatTeacherDate(t.joiningDate) : "—"),
  },
  { key: "salary", label: "Salary", get: (t) => formatSalary(t.salary) },
  { key: "academicYear", label: "Academic Year", get: (t) => display(t.academicYearsDisplay || t.academicYear) },
  {
    key: "classes",
    label: "Classes / Sections",
    get: (t) => t.classesDisplay,
    list: true,
    minWidth: "16rem",
  },
  {
    key: "subjects",
    label: "Subjects",
    get: (t) => t.subjectsDisplay,
    list: true,
    minWidth: "12rem",
  },
  {
    key: "classTeacher",
    label: "Class Teacher",
    get: (t) => t.classTeacherDisplay,
    list: true,
    minWidth: "16rem",
  },
  { key: "assignments", label: "Assignments", get: (t) => display(t.assignmentCount ?? t.assignments?.length) },
  { key: "status", label: "Status", get: (t) => display(t.status) },
];

const TeacherTable = ({ teachers, onEdit, onDelete }) => {
  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No employees found</div>
          <div className="text-gray-400 text-sm">
            Try adjusting your search or add a new teacher
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{teachers.length}</span>{" "}
          employee{teachers.length === 1 ? "" : "s"}. Scroll horizontally; assignment columns wrap to show full text.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 z-10 bg-blue-600">
                #
              </th>
              {TEACHER_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider align-top ${
                    col.list ? "whitespace-normal" : "whitespace-nowrap"
                  }`}
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
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
            {teachers.map((teacher, index) => {
              const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";
              return (
                <tr
                  key={teacher._id || teacher.id || teacher.teacherId || index}
                  className={rowBg}
                >
                  <td
                    className={`px-3 py-3 text-gray-500 font-medium sticky left-0 z-[1] ${rowBg} whitespace-nowrap`}
                  >
                    {index + 1}
                  </td>
                  {TEACHER_COLUMNS.map((col) => {
                    const raw = col.get(teacher);
                    const cellClass = col.list
                      ? "px-3 py-3 text-gray-800 whitespace-normal align-top leading-snug"
                      : col.wide
                        ? "px-3 py-3 text-gray-800 whitespace-normal align-top min-w-[10rem]"
                        : "px-3 py-3 text-gray-800 whitespace-nowrap align-top";
                    return (
                      <td
                        key={col.key}
                        className={cellClass}
                        style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                      >
                        {col.list ? renderListCell(raw) : display(raw)}
                      </td>
                    );
                  })}
                  <td className={`px-3 py-3 sticky right-0 z-[1] ${rowBg} whitespace-nowrap`}>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(teacher)}
                        className="inline-flex items-center px-2 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(teacher)}
                          className="inline-flex items-center px-2 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      )}
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

export default TeacherTable;
