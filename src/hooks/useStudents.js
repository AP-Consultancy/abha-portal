import { useState, useEffect, useCallback } from "react";
import { studentService, STUDENT_PAGE_SIZE } from "../services/studentService";
import { extractFilterOptions } from "../utils/studentUtils";
import { CLASS_OPTIONS, ACADEMIC_YEAR_OPTIONS } from "../utils/constants";

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterOptions, setFilterOptions] = useState({
    classes: CLASS_OPTIONS.map((c) => ({ value: String(c.value), label: c.label })),
    sections: [
      { value: "A", label: "A" },
      { value: "B", label: "B" },
      { value: "C", label: "C" },
    ],
    years: ACADEMIC_YEAR_OPTIONS.map((y) => ({
      value: String(y.value),
      label: y.label,
    })),
  });

  const fetchStudents = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = filters.page ?? 1;

      const result = await studentService.getAllStudents({
        classId: filters.classId || undefined,
        section: filters.section || undefined,
        academicYearId: filters.academicYearId || undefined,
        page: currentPage,
        limit: STUDENT_PAGE_SIZE,
      });

      setStudents(result.students);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);

      if (!filters.classId && !filters.academicYearId) {
        const options = extractFilterOptions(result.students);
        setFilterOptions((prev) => ({
          classes: prev.classes.length ? prev.classes : options.classes,
          sections: prev.sections,
          years: prev.years.length ? prev.years : options.years,
        }));
      }
    } catch (err) {
      setError(err.message);
      setStudents([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStudent = async (enrollmentNo, updateData) => {
    try {
      await studentService.updateStudent(enrollmentNo, updateData);
      await fetchStudents({ page });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteStudent = async (student) => {
    try {
      await studentService.deleteStudent(student);
      await fetchStudents({ page });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchStudents({ page: 1 });
  }, []);

  return {
    students,
    loading,
    error,
    page,
    setPage,
    total,
    totalPages,
    filterOptions,
    fetchStudents,
    updateStudent,
    deleteStudent,
  };
};
