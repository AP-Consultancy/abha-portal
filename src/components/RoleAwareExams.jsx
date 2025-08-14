import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Exams from "../pages/Exams";
import { examService } from "../services/examService";
import {
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const RoleAwareExams = () => {
  const { getUserRole, user } = useAuth();
  const userRole = getUserRole();
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        let data;

        if (userRole === "student") {
          const studentId = user?.userData?._id || user?.student?._id;
          if (studentId) {
            const response = await examService.getStudentExams(studentId);
            data = response.exams || [];
            setExamResults(response.examResults || []);
          }
        } else if (userRole === "teacher" || userRole === "employee") {
          const teacherId = user?.userData?._id || user?.teacher?._id;
          if (teacherId) {
            const response = await examService.getTeacherExams(teacherId);
            data = response.exams || [];
          }
        }

        setExams(data || []);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Failed to load exam information");
      } finally {
        setLoading(false);
      }
    };

    if (userRole !== "admin") {
      fetchExams();
    } else {
      setLoading(false);
    }
  }, [userRole, user]);

  if (userRole === "admin") {
    // Admin sees full exam management interface
    return <Exams />;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const scheduledExams = exams.filter((exam) => exam.status === "Scheduled");
  const completedExams = exams.filter((exam) => exam.status === "Completed");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Exams</h1>
        <p className="text-gray-600">
          {userRole === "student"
            ? "View your exam schedule and results"
            : "View exams you are conducting"}
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <DocumentTextIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Exams Found
            </h3>
            <p className="text-gray-500">
              {userRole === "student"
                ? "You have no exams scheduled yet."
                : "You are not assigned to any exams yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Scheduled Exams */}
          {scheduledExams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Scheduled Exams
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduledExams.map((exam) => (
                  <div
                    key={exam._id}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {exam.title}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {exam.examType}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {exam.subject?.name}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(exam.examDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {exam.startTime} - {exam.endTime}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {exam.teacher?.name}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Room:</span>
                        <span className="font-medium">{exam.room}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">
                          {exam.duration} minutes
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Marks:</span>
                        <span className="font-medium">{exam.totalMarks}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Exams */}
          {completedExams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Completed Exams
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedExams.map((exam) => (
                  <div
                    key={exam._id}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {exam.title}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Completed
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {exam.subject?.name}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(exam.examDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {exam.teacher?.name}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Marks:</span>
                        <span className="font-medium">{exam.totalMarks}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exam Results for Students */}
          {userRole === "student" && examResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                My Results
              </h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Exam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {examResults.map((result) => (
                        <tr key={result._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.exam?.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.exam?.subject?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(
                              result.exam?.examDate
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.marksObtained}/{result.totalMarks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                result.grade === "A+" || result.grade === "A"
                                  ? "bg-green-100 text-green-800"
                                  : result.grade === "B+" ||
                                    result.grade === "B"
                                  ? "bg-blue-100 text-blue-800"
                                  : result.grade === "C+" ||
                                    result.grade === "C"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {result.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleAwareExams;
