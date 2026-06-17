import { getClassLabel, resolveClassId, resolveSectionId } from "./classSectionResolve";

const sanitizeHeader = (header) =>
  String(header)
    .toLowerCase()
    .replace(/['`’]/g, "")
    .replace(/[^a-z0-9]/g, "");

const HEADER_MAP = {
  firstname: "firstName",
  lastname: "lastName",
  gender: "gender",
  dob: "dob",
  dateofbirth: "dob",
  classname: "className",
  class: "className",
  gradename: "className",
  grade: "className",
  standard: "className",
  classid: "classId",
  section: "section",
  sectionname: "section",
  sectionid: "sectionId",
  scholarno: "scholarNumber",
  scholarnumber: "scholarNumber",
  admissionno: "admissionNo",
  rollno: "rollNo",
  phonenumber: "phone",
  phone: "phone",
  email: "email",
  emailaddress: "email",
  streetaddress: "street",
  address: "street",
  city: "city",
  state: "state",
  postalcode: "pincode",
  zipcode: "pincode",
  fathersname: "fatherName",
  mothersname: "motherName",
  studentname: "studentName",
  aadharid: "aadhaarNo",
  aadhaarno: "aadhaarNo",
  samagraid: "sssmid",
  pan: "panNo",
  admissiondate: "admissionDate",
};

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
};

export const parseCsvText = (text) => {
  const lines = String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
};

const mapCsvRow = (row = {}) => {
  const mapped = {};
  for (const [rawKey, value] of Object.entries(row)) {
    const key = HEADER_MAP[sanitizeHeader(rawKey)];
    if (key) mapped[key] = String(value ?? "").trim();
  }
  return mapped;
};

export const readStudentCsvFile = async (file) => {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".csv")) {
    throw new Error("Please upload a .csv file (save Excel as CSV first).");
  }
  const text = await file.text();
  return parseCsvText(text);
};

export const previewCsvRows = (rawRows) =>
  rawRows.map((raw, index) => {
    const mapped = mapCsvRow(raw);
    const classInput = mapped.className || mapped.classId || "";
    const sectionInput = mapped.section || mapped.sectionId || "";
    const classId = resolveClassId(classInput);
    const sectionId = resolveSectionId(sectionInput, classId);

    return {
      row: index + 2,
      scholarNumber: mapped.scholarNumber,
      firstName: mapped.firstName,
      lastName: mapped.lastName,
      className: classInput,
      section: sectionInput,
      classId,
      sectionId,
      classLabel: getClassLabel(classId),
      valid: Boolean(
        mapped.scholarNumber &&
          mapped.firstName &&
          classId &&
          sectionId &&
          mapped.gender &&
          mapped.dob
      ),
    };
  });
