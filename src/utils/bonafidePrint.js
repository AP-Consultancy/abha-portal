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
    student.class_name ||
    student.class ||
    getClassLabel(student.classId || student.class_id) ||
    "";

  const sectionValue = student.section || student.section_name || "";
  const section = sectionValue ? ` (${sectionValue})` : "";

  return {
    student_name: fullName(student),
    scholar_no:
      student.scholarNumber ||
      student.scholar_no ||
      student.scholar_number ||
      student.enrollmentNo ||
      student.admission_no ||
      "",
    class: `${classLabel}${section}`.trim(),
    father_name:
      student.father?.name ||
      student.fatherName ||
      student.father_name ||
      "",
    academic_year:
      student.academicYear || student.academic_year || defaultAcademicYear(),
    dob: formatBonafideDob(student.dob || student.date_of_birth || student.dateOfBirth),
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

  // Some school templates store certificate body text as white, which appears blank in Word.
  // Force readable text color while keeping layout/content intact.
  xml = xml
    .replace(
      /<w:color\s+w:val="FFFFFF"\s+w:themeColor="background1"\s*\/>/g,
      '<w:color w:val="111111"/>'
    )
    .replace(/<w:color\s+w:val="FFFFFF"\s*\/>/g, '<w:color w:val="111111"/>');

  // Keep certificate content within one page by reducing oversized template run fonts.
  xml = xml
    .replace(/<w:sz\s+w:val="40"\s*\/>/g, '<w:sz w:val="30"/>')
    .replace(/<w:szCs\s+w:val="38"\s*\/>/g, '<w:szCs w:val="30"/>')
    .replace(/<w:sz\s+w:val="34"\s*\/>/g, '<w:sz w:val="24"/>')
    .replace(/<w:szCs\s+w:val="32"\s*\/>/g, '<w:szCs w:val="24"/>');

  const footerXml =
    '<w:p><w:pPr><w:spacing w:before="260"/></w:pPr></w:p>' +
    '<w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="9000"/></w:tabs><w:rPr><w:b/><w:color w:val="111111"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:color w:val="111111"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>School Seal</w:t></w:r><w:r><w:tab/></w:r><w:r><w:rPr><w:b/><w:color w:val="111111"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Principal Sign</w:t></w:r></w:p>' +
    '<w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="9000"/></w:tabs><w:rPr><w:color w:val="111111"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:pPr><w:r><w:rPr><w:color w:val="111111"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>(Stamp)</w:t></w:r><w:r><w:tab/></w:r><w:r><w:rPr><w:color w:val="111111"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Principal</w:t></w:r></w:p>';

  if (!xml.includes("Principal Sign")) {
    xml = xml.replace("</w:body>", `${footerXml}</w:body>`);
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
          .docx-bonafide-preview, .docx-bonafide-preview * { color: #111 !important; }
          .docx-bonafide-preview { background: #fff !important; }
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
