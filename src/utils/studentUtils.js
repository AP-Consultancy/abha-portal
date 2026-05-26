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
  const sections = toOptions(studentsData, "sectionId", "section");
  const years = toOptions(studentsData, "academicYearId", "academicYear");

  return { classes, sections, years };
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

  // Apply section filter
  if (selectedSection) {
    filtered = filtered.filter(
      (student) =>
        String(student.sectionId || student.section) === String(selectedSection)
    );
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
    bloodGroup: student.bloodGroup || "",
    religion: student.religion || "",
    caste: student.caste || "",
    nationality: student.nationality || "",
    photoUrl: student.photoUrl || "",
    className: student.className || "",
    section: student.section || "",
    academicYear: student.academicYear || "",
    admissionDate: formatDateForInput(student.admissionDate),
    rollNo: student.rollNo || "",
    phone: student.phone || "",
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
    guardian: {
      name: student.guardian?.name || "",
      phone: student.guardian?.phone || "",
      email: student.guardian?.email || "",
      relation: student.guardian?.relation || "",
    },
    transportOpted: student.transportOpted || false,
    busRoute: student.busRoute || "",
    pickupPoint: student.pickupPoint || "",
    medicalConditions: student.medicalConditions?.join(", ") || "",
    status: student.status || "Active",
    createdBy: student.createdBy || "",
    remarks: student.remarks || "",
  };
};

export const transformFormDataForUpdate = (formData) => {
  return {
    ...formData,
    medicalConditions: formData.medicalConditions
      .split(",")
      .map((condition) => condition.trim())
      .filter(Boolean),
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
