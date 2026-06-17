import {
  ACADEMIC_YEAR_OPTIONS,
  CLASS_OPTIONS,
  SECTION_OPTIONS,
} from "./constants";

export const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const resolveClassId = (classValue) => {
  const direct = toNumberOrNull(classValue);
  if (direct !== null) return direct;

  const byLabel = CLASS_OPTIONS.find(
    (option) =>
      String(option.label).toLowerCase() === String(classValue || "").trim().toLowerCase()
  );
  return byLabel ? toNumberOrNull(byLabel.value) : null;
};

export const resolveSectionId = (sectionValue, classId) => {
  const direct = toNumberOrNull(sectionValue);
  if (direct !== null && direct > 3) return direct;

  const normalized = String(sectionValue || "").trim().toUpperCase();
  const classNum = toNumberOrNull(classId);
  if (classNum === null) return null;
  if (normalized === "A") return classNum;
  if (normalized === "B") return classNum + 15;
  if (normalized === "C") return classNum + 30;
  return null;
};

export const getDefaultAcademicYearId = () => {
  const active = ACADEMIC_YEAR_OPTIONS.find((y) => y.isActive);
  return active?.value || ACADEMIC_YEAR_OPTIONS[0]?.value || "1";
};

export const getClassLabel = (classId) =>
  CLASS_OPTIONS.find((c) => String(c.value) === String(classId))?.label || classId;

export const getSectionLabel = (section) =>
  SECTION_OPTIONS.find((s) => String(s.value) === String(section))?.label || section;

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent" },
  { value: "Leave", label: "Leave" },
];

/** Parse composite class key "classId-sectionId-academicYearId" */
export const parseClassKey = (classKey) => {
  const parts = String(classKey || "")
    .split("-")
    .map((p) => Number(p))
    .filter((n) => Number.isFinite(n));
  if (parts.length < 2) {
    const only = Number(classKey);
    return Number.isFinite(only) ? { classId: only, sectionId: null, academicYearId: null } : null;
  }
  return {
    classId: parts[0],
    sectionId: parts[1],
    academicYearId: parts[2] || null,
  };
};

/** YYYY-MM-DD in local timezone (avoids UTC shift on attendance_date from API) */
export const toLocalDateKey = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return raw.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
