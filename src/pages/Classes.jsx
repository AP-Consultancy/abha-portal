import React, { useState, useEffect, useCallback } from "react";
import { PencilIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { classService } from "../services/classService";
import { teacherService } from "../services/teacherService";
import { ACADEMIC_YEAR_OPTIONS } from "../utils/constants";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [academicYearId, setAcademicYearId] = useState(
    ACADEMIC_YEAR_OPTIONS.find((y) => y.isActive)?.value || ACADEMIC_YEAR_OPTIONS[0]?.value || ""
  );
  const [teachers, setTeachers] = useState([]);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classService.getAllClasses(academicYearId || undefined);
      setClasses(response.classes || []);
      setSummary(response.summary || null);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError(err.message || "Failed to load classes from database");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [academicYearId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    (async () => {
      try {
        const data = await teacherService.getAllTeachers();
        setTeachers(data.teachers || []);
      } catch (e) {
        console.error("Error loading teachers:", e);
      }
    })();
  }, []);

  const handleAssignClassTeacher = async () => {
    if (!editingClass || !selectedTeacherId) return;
    try {
      setSaving(true);
      await classService.assignClassTeacher(editingClass._id, selectedTeacherId);
      setEditingClass(null);
      setSelectedTeacherId("");
      await fetchClasses();
    } catch (e) {
      alert(e.message || "Failed to assign class teacher");
    } finally {
      setSaving(false);
    }
  };

  const derivedFromCards = {
    totalClasses: classes.length,
    totalStudents: classes.reduce(
      (n, c) => n + (c.totalStudents ?? c.students?.length ?? 0),
      0
    ),
    averageStudentsPerClass: classes.length
      ? Math.round(
          classes.reduce((n, c) => n + (c.totalStudents ?? c.students?.length ?? 0), 0) /
            classes.length
        )
      : 0,
    activeClasses: classes.filter(
      (c) => (c.totalStudents ?? c.students?.length ?? 0) > 0
    ).length,
  };
  const summaryHasData =
    summary &&
    (summary.totalClasses > 0 ||
      summary.totalStudents > 0 ||
      summary.activeClasses > 0);
  const stats = summaryHasData ? summary : derivedFromCards;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes Management</h1>
          <p className="text-gray-600 mt-2">
            Live data from PostgreSQL — classes and sections are master data (read-only).
            Assign class teachers below.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic year</label>
          <select
            value={academicYearId}
            onChange={(e) => setAcademicYearId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 min-w-[160px]"
          >
            {ACADEMIC_YEAR_OPTIONS.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <p className="text-sm mt-2">
            Ensure <code className="bg-red-100 px-1 rounded">fn_get_class_management_dashboard</code> and{" "}
            <code className="bg-red-100 px-1 rounded">fn_get_class_dashboard_summary</code> exist in your database.
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Total class sections" value={stats.totalClasses} />
            <StatCard label="Total students" value={stats.totalStudents} />
            <StatCard label="Avg students / section" value={stats.averageStudentsPerClass} />
            <StatCard label="Sections with students" value={stats.activeClasses} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No class/section rows returned for this academic year.
              </div>
            ) : (
              classes.map((classItem) => (
                <div
                  key={classItem._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center gap-2">
                    <AcademicCapIcon className="h-6 w-6 text-white shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {classItem.name} — Section {classItem.section}
                      </h3>
                      {classItem.academicYear && (
                        <p className="text-blue-100 text-sm">{classItem.academicYear}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <Row label="Class teacher" value={classItem.classTeacher?.name || "Not assigned"} />
                    <Row
                      label="Students"
                      value={classItem.totalStudents ?? classItem.students?.length ?? 0}
                    />
                    <Row label="Subjects" value={classItem.totalSubjects ?? 0} />
                    <Row
                      label="Status"
                      value={
                        (classItem.totalStudents ?? 0) > 0 ? (
                          <span className="text-green-600 font-medium">Active</span>
                        ) : (
                          <span className="text-gray-400">No students</span>
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setEditingClass(classItem);
                        setSelectedTeacherId(classItem.classTeacher?._id || "");
                      }}
                      className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Assign class teacher
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Assign class teacher</h3>
            <p className="text-sm text-gray-600 mb-4">
              {editingClass.name} — Section {editingClass.section}
            </p>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => {
                const teacherValue = t.teacherId || t.id || t._id;
                return (
                  <option key={teacherValue} value={teacherValue}>
                    {t.name}
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-gray-500 mb-4">
              The selected teacher will be marked as class teacher for this section. If they are
              not yet assigned here, an assignment will be created automatically.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingClass(null);
                  setSelectedTeacherId("");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedTeacherId || saving}
                onClick={handleAssignClassTeacher}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
    <p className="text-sm font-medium text-gray-600">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="font-medium text-gray-600">{label}</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

export default Classes;
