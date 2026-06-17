export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

export const sectionIdToLabel = (sectionId, classId) => {
  const sid = Number(sectionId);
  const cid = Number(classId);
  if (!Number.isFinite(sid) || !Number.isFinite(cid)) return "";
  if (sid === cid) return "A";
  if (sid === cid + 15) return "B";
  if (sid === cid + 30) return "C";
  return "";
};

/** Map section letter + class to PostgreSQL section_id (A=class, B=class+15, C=class+30). */
export const resolveSectionIdForClass = (classId, sectionLetter) => {
  const cid = Number(classId);
  const letter = String(sectionLetter || "").trim().toUpperCase();
  if (!Number.isFinite(cid) || !letter) return null;
  if (letter === "A") return cid;
  if (letter === "B") return cid + 15;
  if (letter === "C") return cid + 30;
  return null;
};

export const SECTION_FILTER_OPTIONS = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
];

export const getStatusBadgeClasses = (status) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
  if (status === "Active") {
    return `${baseClasses} bg-green-100 text-green-800`;
  }
  return `${baseClasses} bg-gray-100 text-gray-800`;
};

export const extractFilterOptions = (studentsData) => {
  const toOptions = (items, idKey, labelKey) => {
    const optionMap = new Map();

    items.forEach((student) => {
      const label = student[labelKey];
      const value = student[idKey] || label;
      if (value && label && !optionMap.has(String(value))) {
        optionMap.set(String(value), { value: String(value), label: String(label) });
      }
    });

    return [...optionMap.values()].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true })
    );
  };

  const classes = toOptions(studentsData, "classId", "className");
  const years = toOptions(studentsData, "academicYearId", "academicYear");

  return { classes, sections: SECTION_FILTER_OPTIONS, years };
};

export const filterStudents = (students, filters) => {
  const { selectedClass, selectedSection, selectedYear, searchTerm } = filters;

  let filtered = students;

  // Apply class filter
  if (selectedClass) {
    filtered = filtered.filter(
      (student) =>
        String(student.classId || student.className) === String(selectedClass)
    );
  }

  // Apply section filter (A/B/C letter or legacy numeric section_id)
  if (selectedSection) {
    filtered = filtered.filter((student) => {
      const letter = sectionIdToLabel(student.sectionId, student.classId);
      if (["A", "B", "C"].includes(String(selectedSection).toUpperCase())) {
        return letter === String(selectedSection).toUpperCase();
      }
      return String(student.sectionId || student.section) === String(selectedSection);
    });
  }

  // Apply year filter
  if (selectedYear) {
    filtered = filtered.filter(
      (student) =>
        String(student.academicYearId || student.academicYear) ===
        String(selectedYear)
    );
  }

  // Apply search filter
  if (searchTerm.trim() !== "") {
    filtered = filtered.filter(
      (student) =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm)
    );
  }

  return filtered;
};

export const transformStudentForEdit = (student) => {
  return {
    firstName: student.firstName || "",
    middleName: student.middleName || "",
    lastName: student.lastName || "",
    gender: student.gender || "",
    dob: formatDateForInput(student.dob),
    aadhaarNo: student.aadhaarNo || "",
    sssmid: student.sssmid || "",
    panNo: student.panNo || "",
    apaarId: student.apaarId || "",
    // AcademicInfoForm expects `className` to be the class_id (value from CLASS_OPTIONS)
    className: String(student.classId || student.class_id || ""),
    section:
      sectionIdToLabel(
        student.sectionId || student.section_id,
        student.classId || student.class_id
      ) ||
      (["A", "B", "C"].includes(String(student.section || "").toUpperCase())
        ? String(student.section).toUpperCase()
        : ""),
    admissionDate: formatDateForInput(student.admissionDate),
    admissionNo: student.admissionNo || student.enrollmentNo || student.admission_no || student.scholarNumber || "",
    rollNo: student.rollNo || "",
    phone: student.phone || "",
    alternateContactNo: student.alternateContactNo || "",
    email: student.email || "",
    address: {
      street: student.address?.street || "",
      city: student.address?.city || "",
      state: student.address?.state || "",
      postalCode: student.address?.postalCode || "",
      country: student.address?.country || "",
    },
    father: {
      name: student.father?.name || "",
      phone: student.father?.phone || "",
      email: student.father?.email || "",
      relation: "Father",
    },
    mother: {
      name: student.mother?.name || "",
      phone: student.mother?.phone || "",
      email: student.mother?.email || "",
      relation: "Mother",
    },
  };
};

export const transformFormDataForUpdate = (formData) => {
  return {
    ...formData,
    father: {
      ...formData.father,
      relation: "Father",
    },
    mother: {
      ...formData.mother,
      relation: "Mother",
    },
  };
};
