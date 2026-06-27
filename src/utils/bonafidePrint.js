import PizZip from "pizzip";
import { saveAs } from "file-saver";
import { renderAsync } from "docx-preview";
import { getClassLabel } from "./classSectionResolve";

export const BONAFIDE_TEMPLATE_URL = "/templates/BONAFIDE.docx";
export const SCHOOL_NAME = "Aabha Vidya Niketan Hr. Sec. School, Bhopal";

const TEMPLATE_SESSION = "2026-27";

const fullName = (student) =>
  [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() ||
  student.studentName ||
  student.student_name ||
  "";

const formatBonafideDob = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
};

const defaultAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 3) return `${year}-${String(year + 1).slice(-2)}`;
  return `${year - 1}-${String(year).slice(-2)}`;
};

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const buildBonafideData = (student, purpose = "") => {
  const classLabel =
    student.className ||
    getClassLabel(student.classId || student.class_id) ||
    "";

  const section = student.section ? ` (${student.section})` : "";

  return {
    student_name: fullName(student),
    scholar_no: student.scholarNumber || student.enrollmentNo || "",
    class: `${classLabel}${section}`.trim(),
    father_name: student.father?.name || student.fatherName || "",
    academic_year:
      student.academicYear || student.academic_year || defaultAcademicYear(),
    dob: formatBonafideDob(student.dob),
    purpose: purpose.trim() || "official purposes",
  };
};

const fillTemplateBlanks = (zip, data) => {
  const file = zip.file("word/document.xml");
  if (!file) {
    throw new Error("Invalid bonafide template: missing document.xml.");
  }

  let xml = file.asText();

  const blanks = [
    ["_________________", data.student_name],
    ["______________________", data.father_name],
    [" __________", data.class ? ` ${data.class}` : " __________"],
    ["___/____/____.", data.dob ? `${data.dob}.` : "___/____/____."],
    ["________", data.scholar_no || "________"],
  ];

  for (const [pattern, value] of blanks) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(<w:t[^>]*>)${escaped}(</w:t>)`);
    if (!re.test(xml)) {
      throw new Error(
        "Bonafide template format changed. Re-copy BONAFIDE.docx into public/templates/."
      );
    }
    xml = xml.replace(re, `$1${escapeXml(value)}$2`);
  }

  if (data.academic_year) {
    xml = xml.replace(
      `>${TEMPLATE_SESSION}<`,
      `>${escapeXml(data.academic_year)}<`
    );
  }

  zip.file("word/document.xml", xml);
};

export const loadBonafideTemplate = async () => {
  const response = await fetch(BONAFIDE_TEMPLATE_URL);
  if (!response.ok) {
    throw new Error(
      "Bonafide template not found. Place BONAFIDE.docx in public/templates/."
    );
  }
  return response.arrayBuffer();
};

export const generateBonafideDocx = async (student, purpose) => {
  const templateBuffer = await loadBonafideTemplate();
  const zip = new PizZip(templateBuffer);
  fillTemplateBlanks(zip, buildBonafideData(student, purpose));

  return zip.generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
};

export const downloadBonafideDocx = async (student, purpose) => {
  const blob = await generateBonafideDocx(student, purpose);
  const scholar = student.scholarNumber || student.enrollmentNo || "student";
  saveAs(blob, `bonafide-${scholar}.docx`);
};

export const renderBonafidePreview = async (container, student, purpose) => {
  const blob = await generateBonafideDocx(student, purpose);
  container.innerHTML = "";
  await renderAsync(blob, container, null, {
    className: "docx-bonafide-preview",
    inWrapper: true,
    ignoreWidth: false,
    ignoreHeight: false,
    breakPages: true,
  });
  return blob;
};

export const printBonafidePreview = (containerId = "bonafide-print-area") => {
  const area = document.getElementById(containerId);
  if (!area) {
    window.print();
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=1000");
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bonafide Certificate</title>
        <style>
          body { margin: 0; padding: 24px; font-family: "Times New Roman", serif; }
          .docx-wrapper { margin: 0 auto; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${area.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };
};
