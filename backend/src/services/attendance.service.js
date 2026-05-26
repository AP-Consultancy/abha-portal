const { pool } = require("../config/db");

// ============================================
// GET ATTENDANCE
// ============================================

exports.getAttendance = async (
  attendanceId = null,
  studentId = null
) => {

  try {

    const query = `
      SELECT *
      FROM fn_get_student_attendance($1, $2)
    `;

    const values = [
      attendanceId,
      studentId,
    ];

    const result = await pool.query(
      query,
      values
    );

    return result.rows;

  } catch (error) {

    console.error(
      "GET ATTENDANCE SERVICE ERROR:",
      error
    );

    throw new Error(
      error.message ||
      "Something went wrong while fetching attendance"
    );
  }
};
;

// =========================================
// MANAGE STUDENT ATTENDANCE
// =========================================

exports.manageAttendance = async (data) => {

  try {

    await pool.query(

      `CALL sp_manage_student_attendance(

          $1,$2,$3,$4,$5,
          $6,$7,$8,$9

      )`,

      [

        // ACTION
        data.action,

        // ATTENDANCE
        data.attendance_id || null,

        data.student_id || null,

        data.class_id || null,

        data.section_id || null,

        data.attendance_date || null,

        data.status || null,

        data.marked_by || null,

        data.remarks || null,

      ]

    );

    return {

      success: true,

      message:
        data.action === 1
          ? "Attendance marked successfully"
          : data.action === 2
          ? "Attendance updated successfully"
          : "Attendance removed successfully",

    };

  } catch (error) {

    console.error(
      "Attendance Service Error:",
      error
    );

    throw new Error(error.message);

  }
};
