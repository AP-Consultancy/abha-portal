import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { performanceService } from "../services/performanceService";
import BehaviorScorePanel from "../components/performance/BehaviorScorePanel";
import WhatsAppContactButton from "../components/common/WhatsAppContactButton";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  CLASS_OPTIONS,
  SECTION_OPTIONS,
} from "../utils/constants";
import {
  resolveClassId,
  resolveSectionId,
} from "../utils/attendanceUtils";

const statusStyles = {
  Excellent: "text-green-700 bg-green-50",
  Good: "text-blue-700 bg-blue-50",
  Average: "text-yellow-700 bg-yellow-50",
  "Needs Improvement": "text-red-700 bg-red-50",
};

const StudentPerformance = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const isStudent = userRole === "student";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myPerformance, setMyPerformance] = useState(null);
  const [performanceList, setPerformanceList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const loadMyPerformance = useCallback(async () => {
    const data = await performanceService.getMyPerformance();
    setMyPerformance(data);
  }, []);

  const loadPerformanceList = useCallback(async () => {
    const classId = resolveClassId(selectedClass);
    const sectionId = resolveSectionId(selectedSection, classId);
    const data = await performanceService.getPerformanceList({
      classId: classId || undefined,
      sectionId: sectionId || undefined,
    });
    setPerformanceList(Array.isArray(data) ? data : []);
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        if (isStudent) {
          await loadMyPerformance();
        } else {
          await loadPerformanceList();
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load performance data");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isStudent, loadMyPerformance, loadPerformanceList]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner message="Loading performance data..." />
      </div>
    );
  }

  if (isStudent) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Performance & Behavior
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your behavior score is calculated automatically from your attendance, homework, and marks.
          </p>
        </div>
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <BehaviorScorePanel data={myPerformance} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Student Performance & Behavior
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Behavior scores update automatically when attendance, homework, or marks change.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Classes</option>
            {CLASS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Sections</option>
            {SECTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={loadPerformanceList}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : null}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {[
                  "Student",
                  "Class",
                  "Attendance %",
                  "Homework %",
                  "Marks %",
                  "Behavior Score",
                  "Status",
                  "Contact",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {performanceList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No students found for the selected filters.
                  </td>
                </tr>
              ) : (
                performanceList.map((row) => (
                  <tr key={row.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      <div>{row.studentName || "—"}</div>
                      <div className="text-xs text-gray-500">{row.scholarNumber || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {row.className || "—"} {row.section ? `- ${row.section}` : ""}
                    </td>
                    <td className="px-4 py-3 text-sm">{row.attendancePercentage}%</td>
                    <td className="px-4 py-3 text-sm">{row.homeworkPercentage}%</td>
                    <td className="px-4 py-3 text-sm">{row.averageMarksPercentage}%</td>
                    <td className="px-4 py-3 text-sm font-semibold">{row.behaviorScore}%</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusStyles[row.behaviorStatus] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {row.behaviorStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <WhatsAppContactButton
                        student={{
                          studentName: row.studentName,
                          phone: row.phone,
                          scholarNumber: row.scholarNumber,
                        }}
                        message={`Hello, this is regarding ${row.studentName}'s school performance.`}
                        size="xs"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
