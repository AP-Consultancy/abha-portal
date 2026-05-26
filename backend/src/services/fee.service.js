const { pool } = require("../config/db");
const paymentService = require("./payment.service");

const notImplemented = (message) => {
  const error = new Error(message);
  error.statusCode = 501;
  return error;
};

const mapStudent = (row = {}) => ({
  ...row,
  _id: row.student_id || row.id,
  id: row.student_id || row.id,
  firstName: row.first_name || (row.student_name || "").split(" ")[0] || "",
  lastName:
    row.last_name ||
    (row.student_name || "").split(" ").slice(1).join(" ") ||
    "",
  scholarNumber: row.scholar_no || row.admission_no,
  enrollmentNo: row.admission_no || row.scholar_no,
  className: row.class_name || row.class_id || "",
  section: row.section_name || row.section_id || "",
});

const mapCollection = (row = {}) => ({
  ...row,
  _id: row.fee_collection_id || row.collection_id || row.id,
  paymentStatus: row.payment_status || row.status || "PENDING",
  pendingAmount: Number(row.pending_amount || row.balance_amount || 0),
  paidAmount: Number(row.paid_amount || 0),
  totalAmount: Number(row.total_amount || row.amount || 0),
  lateFee: Number(row.late_fee || 0),
  feeComponents: row.fee_components || [],
});

const tryQuery = async (queries, values = []) => {
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

const getStudentByScholarNumber = async (scholarNumber) => {
  const result = await tryQuery(
    [
      "SELECT * FROM fn_get_student_by_scholar_no($1)",
      "SELECT * FROM students WHERE scholar_no = $1 OR admission_no = $1 LIMIT 1",
    ],
    [scholarNumber]
  );

  return result.rows[0] ? mapStudent(result.rows[0]) : null;
};

exports.getFeeDetails = async (studentId) => {
  const result = await tryQuery(
    [
      "SELECT * FROM fn_get_student_fee_details($1)",
      "SELECT * FROM fn_get_fee_details($1)",
      `SELECT *
         FROM fee_collections
        WHERE student_id = $1
        ORDER BY fee_collection_id DESC`,
    ],
    [studentId]
  );

  if (result.rows.length === 1 && result.rows[0].student) {
    return result.rows[0];
  }

  return {
    student: { _id: studentId, id: studentId },
    feeCollections: result.rows.map(mapCollection),
    summary: {
      totalAmount: result.rows.reduce(
        (sum, row) => sum + Number(row.total_amount || row.amount || 0),
        0
      ),
      paidAmount: result.rows.reduce(
        (sum, row) => sum + Number(row.paid_amount || 0),
        0
      ),
    },
  };
};

exports.searchByScholarNumber = async (scholarNumber) => {
  const student = await getStudentByScholarNumber(scholarNumber);

  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  const feeData = await exports.getFeeDetails(student.id);

  return {
    ...feeData,
    student,
  };
};

exports.markPaid = async (data) => {
  const now = new Date();
  await paymentService.managePayment({
    action: 1,
    payment_id: data.payment_id || data.feeCollectionId || null,
    student_id: data.student_id || data.studentId,
    payment_month: data.payment_month || now.getMonth() + 1,
    payment_year: data.payment_year || now.getFullYear(),
    paid_amount: data.paid_amount || data.amount,
    payment_mode: data.payment_mode || data.paymentMethod || "CASH",
    received_by: data.received_by,
    remarks: data.remarks || data.receiptNumber || null,
  });

  return {
    summary: {
      paymentAmount: data.paid_amount || data.amount || null,
    },
  };
};

exports.saveFeeStructure = async (payload) => {
  try {
    await pool.query("CALL sp_manage_fee_structure($1::jsonb)", [
      JSON.stringify(payload),
    ]);
    return { syncResult: {} };
  } catch (error) {
    if (error.code === "42883") {
      throw notImplemented(
        "Fee structure procedure not found. Please share the PostgreSQL procedure name/signature for saving fee structures."
      );
    }
    throw error;
  }
};

exports.assignFeesToClass = async (payload) => {
  try {
    const result = await pool.query("SELECT * FROM fn_assign_fees_to_class($1::jsonb)", [
      JSON.stringify(payload),
    ]);
    return result.rows[0] || {};
  } catch (error) {
    if (error.code === "42883") {
      throw notImplemented(
        "Fee assignment procedure not found. Please share the PostgreSQL procedure name/signature for assigning fees to a class."
      );
    }
    throw error;
  }
};

exports.bulkUploadFeeStructure = async () => {
  throw notImplemented(
    "Fee structure bulk upload needs a multipart parser and the PostgreSQL procedure/signature for importing fee structures."
  );
};

exports.generateFeeCollection = async () => {
  throw notImplemented(
    "Fee collection generation needs the PostgreSQL procedure name/signature from the new backend database."
  );
};

exports.resetStudentToLatestStructure = async () => {
  throw notImplemented(
    "Student fee reset needs the PostgreSQL procedure name/signature from the new backend database."
  );
};
