import React, { useEffect, useMemo, useState } from "react";
import { DocumentTextIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { studentService } from "../services/studentService";
import BonafidePreview from "../components/bonafide/BonafidePreview";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Bonafide = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [previewStudent, setPreviewStudent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await studentService.getAllStudents({ limit: 500 });
        setStudents(result.students || []);
      } catch (err) {
        setError(err.message || "Failed to load students.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter((s) => {
      const name = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
      return (
        name.toLowerCase().includes(term) ||
        String(s.scholarNumber || "").toLowerCase().includes(term) ||
        String(s.enrollmentNo || "").toLowerCase().includes(term) ||
        String(s.rollNo || "").toLowerCase().includes(term)
      );
    });
  }, [students, search]);

  const selectedStudent = students.find(
    (s) => String(s._id || s.id) === String(selectedId)
  );

  const handleGenerate = () => {
    if (!selectedStudent) {
      setError("Please select a student.");
      return;
    }
    setError("");
    setPreviewStudent(selectedStudent);
  };

  if (loading) {
    return <LoadingSpinner message="Loading students..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <DocumentTextIcon className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bonafide Certificate
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate and print bonafide using the school template (admin & teachers only).
          </p>
        </div>
      </div>

      {error && !previewStudent && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search student
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, scholar no., roll no."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select student
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="">Choose a student</option>
            {filteredStudents.map((s) => {
              const name = [s.firstName, s.lastName].filter(Boolean).join(" ");
              const id = s._id || s.id;
              return (
                <option key={id} value={id}>
                  {name} — {s.scholarNumber || s.enrollmentNo} — Class {s.className || "—"}{" "}
                  {s.section ? `(${s.section})` : ""}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Purpose (optional)
          </label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={3}
            placeholder="e.g. passport application, bank account opening"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Generate &amp; preview
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Uses <code>public/templates/BONAFIDE.docx</code>. Student name, parent name, class,
          date of birth, scholar number, and academic session are filled automatically from school
          records.
        </p>
      </div>

      {previewStudent && (
        <BonafidePreview
          student={previewStudent}
          purpose={purpose}
          onClose={() => setPreviewStudent(null)}
        />
      )}
    </div>
  );
};

export default Bonafide;
