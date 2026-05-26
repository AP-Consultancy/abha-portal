// services/student.service.js
const { pool } = require("../config/db");
const bcrypt = require("bcrypt");

const compact = (value) => (value === undefined || value === "" ? null : value);

const mapStudentRow = (row = {}) => ({
  ...row,
  id: row.id || row.student_id,
  student_id: row.student_id || row.id,
  user_id: row.user_id,
  enrollmentNo: row.admission_no || row.scholar_no,
  scholarNumber: row.scholar_no || row.admission_no,
  firstName: row.first_name || (row.student_name || "").split(" ")[0] || "",
  lastName:
    row.last_name ||
    (row.student_name || "").split(" ").slice(1).join(" ") ||
    "",
  email: row.email || "",
  phone: row.phone || row.contact_no || "",
  rollNo: row.roll_no || "",
  className: row.class_name || row.class_id || "",
  section: row.section_name || row.section_id || "",
  dob: row.date_of_birth,
  admissionDate: row.admission_date,
  father: {
    name: row.father_name || "",
    phone: row.father_phone || "",
    email: row.father_email || "",
  },
  mother: {
    name: row.mother_name || "",
    phone: row.mother_phone || row.alternate_contact_no || "",
    email: row.mother_email || "",
  },
  address: {
    street: row.address || "",
    city: row.city || "",
    state: row.state || "",
    postalCode: row.pincode || "",
    country: row.country || "India",
  },
  status: row.status || "Active",
});

const runFirstAvailableQuery = async (queries, values = []) => {
  let lastError;

  for (const query of queries) {
    try {
      return await pool.query(query, values);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

exports.getStudents = async () => {
  const result = await runFirstAvailableQuery([
    "SELECT * FROM fn_get_students()",
    "SELECT * FROM fn_get_all_students()",
    `SELECT s.*, u.first_name, u.last_name, u.email, u.phone
       FROM students s
       LEFT JOIN users u ON u.id = s.user_id
      ORDER BY s.student_id DESC`,
    "SELECT * FROM students ORDER BY student_id DESC",
  ]);

  return result.rows.map(mapStudentRow);
};

exports.getStudentByUserId = async (userId) => {
  const result = await runFirstAvailableQuery(
    [
      "SELECT * FROM fn_get_student_profile($1)",
      `SELECT s.*, u.first_name, u.last_name, u.email, u.phone
         FROM students s
         LEFT JOIN users u ON u.id = s.user_id
        WHERE s.user_id = $1
        LIMIT 1`,
      "SELECT * FROM students WHERE user_id = $1 LIMIT 1",
    ],
    [userId]
  );

  return result.rows[0] ? mapStudentRow(result.rows[0]) : null;
};

exports.manageStudent = async (data) => {
     console.log("Student Service Payload => ", data);

  try {
    let hashedPassword = null;
    // HASH SCHOLAR NO AS PASSWORD ONLY FOR CREATE
    if (data.action === 1 && data.scholar_no) {
      hashedPassword = await bcrypt.hash(
        data.scholar_no.toString(),
        10
      );
    }
    await pool.query(
      `CALL sp_manage_student(
        $1,$2,$3,$4,$5,$6,$7,$8,
        $9,$10,$11,$12,$13,$14,
        $15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,
        $27,$28,$29,$30
      )`,
      [
        data.action,
        // USER
        compact(data.user_id),
        compact(data.first_name),
        compact(data.last_name),
        compact(data.email),
        compact(data.phone),
        hashedPassword,
        "STUDENT",
        // STUDENT
        data.student_id || null,
        data.admission_no || null,
        data.scholar_no || null,
        data.roll_no || null,
        data.class_id || null,
        data.section_id || null,
        data.student_name || null,
        data.father_name || null,
        data.mother_name || null,
        data.gender || null,
        data.date_of_birth || null,
        data.aadhaar_no || null,
        data.sssmid || null,
        data.pan_no || null,
        data.apaar_id || null,
        data.contact_no || null,
        data.alternate_contact_no || null,
        data.address || null,
        data.city || null,
        data.state || null,
        data.pincode || null,

        data.admission_date || null,
      ]
    );

    return {
      success: true,
      message:
        data.action === 1
          ? "Student created successfully"
          : data.action === 2
          ? "Student updated successfully"
          : "Student deleted successfully",
    };

  } catch (error) {
    console.error("`Student Service Error:`", error);

    throw new Error(error.message);
  }
};
