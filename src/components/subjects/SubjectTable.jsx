import React from "react";
import { PencilIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/outline";

const display = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
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
    custom: "assignments-teachers",
    minWidth: "14rem",
  },
  {
    key: "classes",
    label: "Class / Sections (from assignments)",
    custom: "assignments-classes",
    minWidth: "14rem",
  },
  { key: "assignments", label: "# Assignments", get: (s) => display(s.assignmentCount) },
];

const renderAssignmentTeachers = (subject, onRemoveAssignment, removingKey) => {
  const assignments = subject.assignments || [];
  if (!assignments.length) return "—";

  return (
    <ul className="m-0 list-none space-y-1.5 p-0">
      {assignments.map((assignment) => {
        const removeKey = `${subject.id}-${assignment.assignmentId}`;
        return (
          <li
            key={assignment.assignmentId || removeKey}
            className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5"
          >
            <span className="min-w-0 flex-1 text-gray-800">{assignment.teacherName}</span>
            {onRemoveAssignment && (
              <button
                type="button"
                onClick={() => onRemoveAssignment(subject, assignment)}
                disabled={removingKey === removeKey}
                title={`Remove ${assignment.teacherName}`}
                className="shrink-0 rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const renderAssignmentClasses = (subject) => {
  const assignments = subject.assignments || [];
  if (!assignments.length) return "—";

  return (
    <ul className="m-0 list-none space-y-1.5 p-0">
      {assignments.map((assignment) => (
        <li
          key={`class-${assignment.assignmentId}`}
          className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-gray-700"
        >
          {assignment.classSectionLabel}
          {assignment.isClassTeacher && (
            <span className="ml-1 text-xs text-green-700">(Class teacher)</span>
          )}
        </li>
      ))}
    </ul>
  );
};

const SubjectTable = ({
  subjects,
  onEdit,
  onDelete,
  onAssign,
  onRemoveAssignment,
  removingKey,
}) => {
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
          table. Use the bin icon next to a teacher to remove that assignment, or{" "}
          <strong>Assign</strong> to add a new one.
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
                    col.custom ? "whitespace-normal" : "whitespace-nowrap"
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
                        col.custom
                          ? "whitespace-normal"
                          : col.wide
                            ? "whitespace-normal min-w-[12rem] max-w-md"
                            : "whitespace-nowrap"
                      }`}
                      style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                    >
                      {col.custom === "assignments-teachers"
                        ? renderAssignmentTeachers(
                            subject,
                            onRemoveAssignment,
                            removingKey
                          )
                        : col.custom === "assignments-classes"
                          ? renderAssignmentClasses(subject)
                          : col.get(subject)}
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
                        title="Delete subject from catalog"
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
