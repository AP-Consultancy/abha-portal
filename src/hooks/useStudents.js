import { useState, useEffect } from "react";
import { studentService } from "../services/studentService";
import { extractFilterOptions } from "../utils/studentUtils";

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    classes: [],
    sections: [],
    years: [],
  });

  const fetchStudents = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const studentsData = await studentService.getAllStudents(filters);
      setStudents(studentsData);

      const options = extractFilterOptions(studentsData);
      const hasServerFilters =
        filters.classId || filters.sectionId || filters.academicYearId;

      if (!hasServerFilters || filterOptions.classes.length === 0) {
        setFilterOptions({
          classes: options.classes,
          sections: options.sections,
          years: options.years,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (enrollmentNo, updateData) => {
    try {
      await studentService.updateStudent(enrollmentNo, updateData);
      // Refresh the students list after successful update
      await fetchStudents();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteStudent = async (student) => {
    try {
      await studentService.deleteStudent(student);
      await fetchStudents();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    filterOptions,
    fetchStudents,
    updateStudent,
    deleteStudent,
  };
};
