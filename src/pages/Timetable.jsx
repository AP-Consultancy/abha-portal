import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  AcademicCapIcon,
  BookOpenIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import CSVUpload from "../components/common/CSVUpload";
import { classService } from "../services/classService";
import { subjectService } from "../services/subjectService";
import { teacherService } from "../services/teacherService";
import { timetableService } from "../services/timetableService";
import {
  TIMETABLE_DAYS,
  TIMETABLE_TIME_SLOTS,
  getPeriodAtSlot,
  displayName,
} from "../utils/timetableConstants";

const emptyPeriodForm = () => ({
  day: "Monday",
  time: TIMETABLE_TIME_SLOTS[0],
  subjectId: "",
  teacherId: "",
  room: "",
});

const Timetable = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [schedule, setSchedule] = useState({});
  const [classAssignments, setClassAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodForm, setPeriodForm] = useState(emptyPeriodForm());
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  const selectedClassMeta = useMemo(
    () => classes.find((cls) => (cls._id || cls.id) === selectedClass),
    [classes, selectedClass]
  );

  const subjectOptions = useMemo(() => {
    const fromClass = (classAssignments || []).map((row) => ({
      _id: row.subject?._id || row._id,
      name: row.subject?.name || row.name,
      teacherId: row.teacher?._id || "",
      teacherName: row.teacher?.name || "",
    }));
    const seen = new Set();
    return fromClass.filter((item) => {
      if (!item._id || seen.has(item._id)) return false;
      seen.add(item._id);
      return true;
    });
  }, [classAssignments]);

  const teacherOptions = useMemo(() => {
    const map = new Map(teachers.map((t) => [String(t._id || t.id), t]));
    subjectOptions.forEach((subj) => {
      if (subj.teacherId && !map.has(String(subj.teacherId))) {
        map.set(String(subj.teacherId), {
          _id: subj.teacherId,
          name: subj.teacherName,
        });
      }
    });
    return [...map.values()];
  }, [teachers, subjectOptions]);

  const loadClasses = useCallback(async () => {
    const [classesRes, teachersRes] = await Promise.all([
      classService.getAllClasses(),
      teacherService.getAllTeachers(),
    ]);
    const fetchedClasses = classesRes.classes || classesRes || [];
    setClasses(fetchedClasses);
    setTeachers(teachersRes.teachers || teachersRes || []);
    return fetchedClasses;
  }, []);

  const loadClassAssignments = useCallback(async (classId) => {
    if (!classId) {
      setClassAssignments([]);
      return;
    }
    const cls = classes.find((c) => (c._id || c.id) === classId);
    if (cls?.subjects?.length) {
      setClassAssignments(cls.subjects);
      return;
    }
    try {
      const data = await subjectService.getSubjectsByClass(classId);
      setClassAssignments(data.subjects || []);
    } catch {
      setClassAssignments([]);
    }
  }, [classes]);

  const loadTimetable = useCallback(async (classId) => {
    if (!classId) return;
    const data = await timetableService.getClassTimetable(classId);
    setSchedule(data.timetable?.schedule || {});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const fetchedClasses = await loadClasses();
        if (fetchedClasses.length > 0) {
          setSelectedClass((prev) => prev || fetchedClasses[0]._id || fetchedClasses[0].id);
        }
      } catch (err) {
        setError(err.message || "Failed to load timetable data");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadClasses]);

  useEffect(() => {
    if (!selectedClass) return;
    (async () => {
      try {
        setError("");
        await Promise.all([
          loadTimetable(selectedClass),
          loadClassAssignments(selectedClass),
        ]);
      } catch (err) {
        setError(err.message || "Failed to load class timetable");
      }
    })();
  }, [selectedClass, classes, loadTimetable, loadClassAssignments]);

  const openPeriodModal = (day, timeSlot, existing = null) => {
    if (existing) {
      setPeriodForm({
        day,
        time: existing.time || timeSlot,
        subjectId: existing.subject?._id || "",
        teacherId: existing.teacher?._id || "",
        room: existing.room || "",
      });
      setIsEditingExisting(true);
    } else {
      setPeriodForm({ ...emptyPeriodForm(), day, time: timeSlot });
      setIsEditingExisting(false);
    }
    setShowPeriodModal(true);
  };

  const handleSubjectChange = (subjectId) => {
    const match = subjectOptions.find((s) => String(s._id) === String(subjectId));
    setPeriodForm((prev) => ({
      ...prev,
      subjectId,
      teacherId: match?.teacherId ? String(match.teacherId) : prev.teacherId,
    }));
  };

  const handleSavePeriod = async () => {
    if (!selectedClass) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await timetableService.upsertEntry({
        classId: selectedClass,
        day: periodForm.day,
        time: periodForm.time,
        subjectId: periodForm.subjectId || null,
        teacherId: periodForm.teacherId || null,
        room: periodForm.room,
      });
      await loadTimetable(selectedClass);
      setShowPeriodModal(false);
      setSuccess("Period saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save period");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePeriod = async () => {
    if (!selectedClass || !window.confirm("Remove this period from the timetable?")) return;
    try {
      setSaving(true);
      setError("");
      await timetableService.deleteEntry({
        classId: selectedClass,
        day: periodForm.day,
        time: periodForm.time,
      });
      await loadTimetable(selectedClass);
      setShowPeriodModal(false);
      setSuccess("Period removed.");
    } catch (err) {
      setError(err.message || "Failed to delete period");
    } finally {
      setSaving(false);
    }
  };

  const handleCSVUpload = async (formData) => {
    const result = await timetableService.bulkUpload(formData);
    if (selectedClass) await loadTimetable(selectedClass);
    setSuccess(
      `Bulk upload complete: ${result.successful || 0} saved${
        result.failed ? `, ${result.failed} failed` : ""
      }.`
    );
    return result;
  };

  const periodCount = TIMETABLE_DAYS.reduce(
    (total, day) => total + (schedule[day]?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading timetable...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Assign subjects and teachers for every class and section, period by period.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openPeriodModal("Monday", TIMETABLE_TIME_SLOTS[0])}
          disabled={!selectedClass}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          Add Period
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Class & Section</label>
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls._id || cls.id} value={cls._id || cls.id}>
                    {cls.name} — Section {cls.section}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="rounded-lg bg-blue-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-blue-700">Scheduled periods</p>
            <p className="text-2xl font-semibold text-blue-900">{periodCount}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Subjects assigned</p>
            <p className="text-2xl font-semibold text-gray-900">{subjectOptions.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Academic year</p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedClassMeta?.academicYear || "Current"}
            </p>
          </div>
        </div>
      </div>

      {subjectOptions.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Class subject assignments</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjectOptions.map((subj) => (
              <span
                key={subj._id}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                {subj.name}
                {subj.teacherName ? ` · ${subj.teacherName}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Weekly schedule</h2>
          <p className="text-sm text-gray-500">Click any cell to assign or edit a period.</p>
        </div>
        {!selectedClass ? (
          <div className="p-12 text-center text-gray-500">Select a class to manage its timetable.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Time
                  </th>
                  {TIMETABLE_DAYS.map((day) => (
                    <th
                      key={day}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {TIMETABLE_TIME_SLOTS.map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        {timeSlot}
                      </div>
                    </td>
                    {TIMETABLE_DAYS.map((day) => {
                      const period = getPeriodAtSlot(schedule, day, timeSlot);
                      const subjectLabel = displayName(period?.subject);
                      const teacherLabel = displayName(period?.teacher);
                      const isBreak = ["Break", "Lunch"].includes(subjectLabel);
                      return (
                        <td key={`${day}-${timeSlot}`} className="px-2 py-2 align-top">
                          <button
                            type="button"
                            onClick={() => openPeriodModal(day, timeSlot, period)}
                            className={`min-h-[88px] w-full rounded-lg border p-3 text-left transition hover:shadow-sm ${
                              period
                                ? isBreak
                                  ? "border-yellow-200 bg-yellow-50"
                                  : "border-blue-200 bg-blue-50"
                                : "border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40"
                            }`}
                          >
                            {period ? (
                              <>
                                <div className="text-sm font-semibold text-gray-900">{subjectLabel}</div>
                                {teacherLabel && (
                                  <div className="mt-1 text-xs text-gray-600">{teacherLabel}</div>
                                )}
                                {period.room && (
                                  <div className="mt-1 text-xs text-gray-500">{period.room}</div>
                                )}
                              </>
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                <PlusIcon className="mr-1 h-4 w-4" />
                                Assign
                              </div>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Bulk import</h2>
          <button
            type="button"
            onClick={() => setShowCSVUpload((prev) => !prev)}
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            {showCSVUpload ? "Hide upload" : "Show upload"}
          </button>
        </div>
        {showCSVUpload && (
          <CSVUpload
            onUpload={handleCSVUpload}
            title="Upload timetable CSV"
            description="Columns: class, section, day, time, subject, teacher, room"
            entityType="timetable entries"
            acceptedFileTypes=".csv,.xlsx,.xls"
            maxFileSize={10}
            showCredentialExport={false}
          />
        )}
      </div>

      {showPeriodModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 py-8">
            <div
              className="fixed inset-0 bg-gray-500/75"
              onClick={() => !saving && setShowPeriodModal(false)}
            />
            <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditingExisting ? "Edit period" : "Assign period"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPeriodModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Day</label>
                    <select
                      value={periodForm.day}
                      onChange={(e) => setPeriodForm({ ...periodForm, day: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      {TIMETABLE_DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Time slot</label>
                    <select
                      value={periodForm.time}
                      onChange={(e) => setPeriodForm({ ...periodForm, time: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      {TIMETABLE_TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
                  <select
                    value={periodForm.subjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select subject</option>
                    {subjectOptions.map((subj) => (
                      <option key={subj._id} value={subj._id}>
                        {subj.name}
                      </option>
                    ))}
                  </select>
                  {subjectOptions.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      No subject assignments for this class. Assign subjects in Class/Subject management first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Teacher</label>
                  <select
                    value={periodForm.teacherId}
                    onChange={(e) => setPeriodForm({ ...periodForm, teacherId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select teacher</option>
                    {teacherOptions.map((teacher) => (
                      <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Room</label>
                  <input
                    type="text"
                    value={periodForm.room}
                    onChange={(e) => setPeriodForm({ ...periodForm, room: e.target.value })}
                    placeholder="e.g. Room 101"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                {isEditingExisting ? (
                  <button
                    type="button"
                    onClick={handleDeletePeriod}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remove
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPeriodModal(false)}
                    disabled={saving}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePeriod}
                    disabled={saving || !periodForm.subjectId}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <PencilIcon className="h-4 w-4" />
                    {saving ? "Saving..." : "Save period"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
