import React, { useState, useEffect } from "react";
import { studentService } from "../../services/studentService";
import { useApp } from "../../contexts/AppContext";
import LoadingSpinner from "../common/LoadingSpinner";

const StudentSelector = () => {
  const { dispatch } = useApp();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (search = "") => {
    setLoading(true);
    try {
      const response = await studentService.getAllStudents({
        search,
        limit: 50,
      });
      setStudents(response);
    } catch (error) {
      console.error("Error fetching students:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch students" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const timeoutId = setTimeout(() => {
      fetchStudents(term);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudentId(studentId);
    const selectedStudent = students.find((s) => s._id === studentId);
    if (selectedStudent) {
      dispatch({ type: "SET_STUDENT", payload: selectedStudent });
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          🎓 Select Student
        </h2>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search by name, student ID, or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>

        {loading && (
          <div className="mb-4">
            <LoadingSpinner size="small" message="Searching students..." />
          </div>
        )}

        <div className="mb-4">
          <select
            value={selectedStudentId}
            onChange={(e) => handleStudentSelect(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Student --</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName} ({student.enrollmentNo})
                - {student.className}
              </option>
            ))}
          </select>
        </div>

        {students.length === 0 && !loading && (
          <p className="text-center text-red-500">No students found</p>
        )}
      </div>
    </div>
  );
};

export default StudentSelector;
