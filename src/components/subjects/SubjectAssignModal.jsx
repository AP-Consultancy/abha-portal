import React, { useEffect, useState } from "react";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { subjectService } from "../../services/subjectService";
import { teacherService } from "../../services/teacherService";
import {
  ACADEMIC_YEAR_OPTIONS,
  CLASS_OPTIONS,
  SECTION_OPTIONS,
} from "../../utils/constants";
import { resolveSectionId } from "../../utils/attendanceUtils";

const SubjectAssignModal = ({ subject, onClose, onSaved }) => {
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    teacherId: "",
    classId: "",
    section: "A",
    academicYearId: ACADEMIC_YEAR_OPTIONS[0]?.value || "1",
    isClassTeacher: false,
  });

  const load = async () => {
    const subjectId = subject?.id || subject?._id;
    if (!subjectId) return;
    try {
      setLoading(true);
      setError("");
      const [teacherRes, assignRes] = await Promise.all([
        teacherService.getAllTeachers(),
        subjectService.getSubjectAssignments(subjectId),
      ]);
      setTeachers(teacherRes.teachers || []);
      setAssignments(assignRes.assignments || []);
    } catch (e) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const subjectId = subject?.id || subject?._id;
    if (subjectId) load();
  }, [subject?.id, subject?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const subjectId = subject?.id || subject?._id;
    if (!subjectId) return;
    if (!form.teacherId || !form.classId || !form.section) {
      setError("Select teacher, class, and section");
      return;
    }
    const sectionId = resolveSectionId(form.section, form.classId);
    if (!sectionId) {
      setError("Invalid section for this class");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await subjectService.assignTeacherToSubject(subjectId, {
        teacher_id: form.teacherId,
        class_id: Number(form.classId),
        section_id: sectionId,
        academic_year_id: Number(form.academicYearId),
        is_class_teacher: form.isClassTeacher,
      });
      await load();
      onSaved?.();
      setForm((prev) => ({
        ...prev,
        teacherId: "",
        isClassTeacher: false,
      }));
    } catch (e) {
      setError(e.message || "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId, teacherName) => {
    const subjectId = subject.id || subject._id;
    if (
      !window.confirm(
        `Remove ${teacherName || "this teacher"} from ${subject.name}?`
      )
    ) {
      return;
    }
    try {
      setRemovingId(assignmentId);
      setError("");
      await subjectService.removeTeacherAssignment(subjectId, assignmentId);
      await load();
      onSaved?.();
    } catch (e) {
      setError(e.message || "Failed to remove assignment");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assign teacher & class</h2>
            <p className="text-sm text-gray-600">
              {subject.name} ({subject.code})
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4 border border-indigo-100 rounded-lg p-4 bg-indigo-50/50">
                <p className="text-sm font-medium text-gray-800">New assignment</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
                  <select
                    value={form.teacherId}
                    onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((t) => (
                      <option key={t.teacherId || t.id} value={t.teacherId || t.id}>
                        {t.name} ({t.enrollmentNo || t.employee_id || "—"})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                    <select
                      value={form.classId}
                      onChange={(e) => setForm({ ...form, classId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Select class</option>
                      {CLASS_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                    <select
                      value={form.section}
                      onChange={(e) => setForm({ ...form, section: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      {SECTION_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic year</label>
                  <select
                    value={form.academicYearId}
                    onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {ACADEMIC_YEAR_OPTIONS.map((y) => (
                      <option key={y.value} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isClassTeacher}
                    onChange={(e) =>
                      setForm({ ...form, isClassTeacher: e.target.checked })
                    }
                  />
                  Class teacher for this section
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Add assignment"}
                </button>
              </form>

              <div>
                <p className="text-sm font-medium text-gray-800 mb-2">Current assignments</p>
                {assignments.length === 0 ? (
                  <p className="text-sm text-gray-500">None yet for this subject.</p>
                ) : (
                  <ul className="text-sm space-y-2 max-h-48 overflow-y-auto">
                    {assignments.map((a) => (
                      <li
                        key={a.assignmentId}
                        className="flex items-start justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-medium">{a.teacherName}</span>
                          <span className="text-gray-600">
                            {" "}
                            — {a.className} Section {a.sectionName}
                          </span>
                          {a.isClassTeacher && (
                            <span className="ml-2 text-xs text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                              Class teacher
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveAssignment(a.assignmentId, a.teacherName)
                          }
                          disabled={removingId === a.assignmentId}
                          title="Remove teacher assignment"
                          className="shrink-0 rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectAssignModal;
