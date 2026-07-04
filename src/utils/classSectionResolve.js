import { CLASS_OPTIONS } from "./constants";

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeClassText = (raw) =>
  String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\bstandard\b/g, "")
    .replace(/\bstd\.?\b/g, "")
    .replace(/\bgrade\b/g, "")
    .replace(/\bclass\b/g, "")
    .replace(/\s+/g, "")
    .replace(/-/g, "");

const findClassByGradeNumber = (gradeNum) => {
  if (!Number.isFinite(gradeNum) || gradeNum < 1 || gradeNum > 12) return null;
  const suffix =
    gradeNum === 1 ? "st" : gradeNum === 2 ? "nd" : gradeNum === 3 ? "rd" : "th";
  const target = `${gradeNum}${suffix}`;
  return CLASS_OPTIONS.find((c) => c.label.toLowerCase() === target) || null;
};

export const extractSectionLetter = (raw) => {
  const text = String(raw || "").trim().toUpperCase();
  if (/^[ABC]$/.test(text)) return text;
  const patterns = [
    /\bSECTION\s*[-:]?\s*([ABC])\b/,
    /\bSEC\.?\s*[-:]?\s*([ABC])\b/,
    /\bDIV(?:ISION)?\s*[-:]?\s*([ABC])\b/,
    /\b([ABC])\s*SECTION\b/,
    /\b([ABC])\b/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
};

/**
 * Map class label or id string to PostgreSQL class_id (matches CLASS_OPTIONS / classes table).
 * Accepts dropdown values ("11"), labels ("8th"), "Grade 8", "KG1", etc.
 */
export const resolveClassId = (input) => {
  if (input === undefined || input === null || input === "") return null;

  const direct = toNumberOrNull(input);
  if (
    direct !== null &&
    CLASS_OPTIONS.some((c) => String(c.value) === String(direct))
  ) {
    return direct;
  }

  const raw = String(input).trim();
  if (!raw) return null;

  const normalized = normalizeClassText(raw);
  if (!normalized) return null;

  const byLabel = CLASS_OPTIONS.find((c) => {
    const lbl = normalizeClassText(c.label);
    return normalized === lbl || normalized.startsWith(lbl) || lbl.startsWith(normalized);
  });
  if (byLabel) return Number(byLabel.value);

  const kgMatch = normalized.match(/^kg\s*([12])$/);
  if (kgMatch) {
    const kg = CLASS_OPTIONS.find((c) => c.label.toLowerCase() === `kg${kgMatch[1]}`);
    if (kg) return Number(kg.value);
  }

  if (normalized === "nursery" || normalized === "lkg" || normalized === "prekg") {
    const nursery = CLASS_OPTIONS.find((c) => c.label === "Nursery");
    if (nursery) return Number(nursery.value);
  }

  const digits = raw.match(/\d{1,2}/);
  if (digits) {
    const byNum = findClassByGradeNumber(Number(digits[0]));
    if (byNum) return Number(byNum.value);
  }

  const ordinalMatch = normalized.match(/^(\d{1,2})(st|nd|rd|th)?$/);
  if (ordinalMatch) {
    const byNum = findClassByGradeNumber(Number(ordinalMatch[1]));
    if (byNum) return Number(byNum.value);
  }

  return null;
};

/**
 * Map section letter or id to PostgreSQL section_id for a class.
 */
export const resolveSectionId = (sectionInput, classId) => {
  const classNum = toNumberOrNull(classId);
  if (classNum === null) return null;

  const direct = toNumberOrNull(sectionInput);
  if (direct === classNum || direct === classNum + 15 || direct === classNum + 30) {
    return direct;
  }

  const letter = extractSectionLetter(sectionInput);
  if (letter === "A") return classNum;
  if (letter === "B") return classNum + 15;
  if (letter === "C") return classNum + 30;
  return null;
};

export const getClassLabel = (classId) =>
  CLASS_OPTIONS.find((c) => String(c.value) === String(classId))?.label || classId || "—";
