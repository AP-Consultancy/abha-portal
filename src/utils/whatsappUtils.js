export const getStudentPhone = (student = {}) => {
  const candidates = [
    student.phone,
    student.contactNo,
    student.contact_no,
    student.father?.phone,
    student.mother?.phone,
    student.alternateContactNo,
    student.alternate_contact_no,
  ];

  for (const value of candidates) {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.length >= 10) return digits;
  }
  return "";
};

export const getStudentDisplayName = (student = {}) => {
  const name =
    student.studentName ||
    student.name ||
    [student.firstName, student.lastName].filter(Boolean).join(" ").trim();
  return name || "Student";
};

export const buildWhatsAppUrl = (phone, message = "") => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 10) return null;

  const normalized =
    digits.length === 10 ? `91${digits}` : digits.startsWith("91") ? digits : `91${digits.slice(-10)}`;

  const base = `https://wa.me/${normalized}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
};

export const openWhatsAppForStudent = (student, message = "") => {
  const phone = getStudentPhone(student);
  if (!phone) {
    return {
      success: false,
      message: "No registered mobile number found for this student.",
    };
  }

  const url = buildWhatsAppUrl(phone, message);
  if (!url) {
    return {
      success: false,
      message: "Invalid mobile number for WhatsApp contact.",
    };
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return { success: true };
};
