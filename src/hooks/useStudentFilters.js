import { useState, useEffect } from "react";
import { filterStudents } from "../utils/studentUtils";

export const useStudentFilters = (students) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  const filters = {
    selectedClass,
    selectedSection,
    selectedYear,
    searchTerm,
  };

  const clearAllFilters = () => {
    setSelectedClass("");
    setSelectedSection("");
    setSelectedYear("");
    setSearchTerm("");
  };

  const clearIndividualFilter = (filterType) => {
    switch (filterType) {
      case "class":
        setSelectedClass("");
        break;
      case "section":
        setSelectedSection("");
        break;
      case "year":
        setSelectedYear("");
        break;
      default:
        break;
    }
  };

  const hasActiveFilters = selectedClass || selectedSection || selectedYear;

  useEffect(() => {
    const filtered = filterStudents(students, filters);
    setFilteredStudents(filtered);
  }, [students, selectedClass, selectedSection, selectedYear, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
    selectedYear,
    setSelectedYear,
    filteredStudents,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
    filters,
  };
};
