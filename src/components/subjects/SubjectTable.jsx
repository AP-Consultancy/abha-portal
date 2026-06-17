import React from "react";
import { PencilIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/outline";

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
    if (commaParts.length > 2) {
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

const SUBJECT_COLUMNS = [
  { key: "id", label: "ID", get: (s) => display(s.id) },
  { key: "name", label: "Subject Name", get: (s) => display(s.name) },
  { key: "code", label: "Code", get: (s) => display(s.code) },
  { key: "grade", label: "Grade", get: (s) => display(s.grade) },
  { key: "hours", label: "Hours / Week", get: (s) => display(s.hoursPerWeek) },
  {
    key: "description",
    label: "Description",
    get: (s) => display(s.description),
    wide: true,
  },
  {
    key: "teachers",
    label: "Teachers (from assignments)",
    get: (s) => s.teachersDisplay,
    list: true,
    minWidth: "12rem",
  },
  {
    key: "classes",
    label: "Class / Sections (from assignments)",
    get: (s) => s.classSectionsDisplay,
    list: true,
    minWidth: "14rem",
  },
  { key: "assignments", label: "# Assignments", get: (s) => display(s.assignmentCount) },
];

const SubjectTable = ({ subjects, onEdit, onDelete, onAssign }) => {
  if (!subjects.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
        No subjects in the master catalog. Add subjects or bulk upload a CSV.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Master catalog from <code className="text-xs bg-gray-100 px-1 rounded">subjects</code>{" "}
          table. Who teaches what is stored in{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">teacher_class_assignments</code>{" "}
          (assign via Employees / Add Teacher).
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase sticky left-0 z-10 bg-indigo-600">
                #
              </th>
              {SUBJECT_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-3 text-left text-xs font-semibold uppercase align-top ${
                    col.list ? "whitespace-normal" : "whitespace-nowrap"
                  }`}
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                >
                  {col.label}
                </th>
              ))}
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase sticky right-0 z-10 bg-purple-600 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subjects.map((subject, index) => {
              const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";
              return (
                <tr key={subject.id || index}>
                  <td
                    className={`px-3 py-3 text-gray-500 sticky left-0 z-[1] ${rowBg}`}
                  >
                    {index + 1}
                  </td>
                  {SUBJECT_COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3 py-3 text-gray-800 align-top ${
                        col.list
                          ? "whitespace-normal"
                          : col.wide
                            ? "whitespace-normal min-w-[12rem] max-w-md"
                            : "whitespace-nowrap"
                      }`}
                      style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                    >
                      {col.list ? renderListCell(col.get(subject)) : col.get(subject)}
                    </td>
                  ))}
                  <td className={`px-3 py-3 sticky right-0 z-[1] ${rowBg} whitespace-nowrap`}>
                    <div className="flex gap-2">
                      {onAssign && (
                        <button
                          type="button"
                          onClick={() => onAssign(subject)}
                          className="inline-flex items-center px-2 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs"
                          title="Assign teacher and class"
                        >
                          <UserPlusIcon className="h-4 w-4 mr-1" />
                          Assign
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(subject)}
                        className="inline-flex items-center px-2 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(subject)}
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

export default SubjectTable;
