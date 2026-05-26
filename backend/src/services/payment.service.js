const { pool } = require("../config/db");

exports.managePayment = async (data) => {
  try{
  await pool.query(
    `CALL sp_manage_fee_payment($1,$2,$3,$4,$5,$6,$7,$8,$9)`,

    [
      // ACTION
      data.action,
      // PAYMENT ID
      data.payment_id || null,
      // STUDENT ID
      data.student_id || null,
      // PAYMENT MONTH
      data.payment_month || null,
      // PAYMENT YEAR
      data.payment_year || null,
      // PAID AMOUNT
      data.paid_amount || null,
      // PAYMENT MODE
      data.payment_mode || "CASH",
      // RECEIVED BY
      data.received_by || null,
      // REMARKS
      data.remarks || null,
    ],
  );}
  catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to manage payment");
  } 

  return true;
};
