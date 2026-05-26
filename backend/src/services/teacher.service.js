const { pool } = require("../config/db");

const bcrypt = require("bcrypt");

// =========================================
// MANAGE TEACHER
// =========================================

exports.manageTeacher = async (data) => {

  try {

    let hashedPassword = null;

    // =========================================
    // HASH PASSWORD ONLY FOR CREATE
    // =========================================

    if (data.action === 1 && data.password) {

      hashedPassword = await bcrypt.hash(data.password, 10);

    }

    // =========================================
    // CALL PROCEDURE
    // =========================================

    await pool.query(

      `CALL sp_manage_teacher(

          $1,$2,$3,$4,$5,$6,$7,
          $8,$9,$10,$11,$12,$13,
          $14,$15,$16,$17,$18,$19

      )`,

      [

        // ACTION
        data.action,

        // USER
        data.user_id || null,

        data.first_name || null,

        data.last_name || null,

        data.email || null,

        data.phone || null,

        hashedPassword,

        // TEACHER
        data.teacher_id || null,

        data.employee_id || null,

        data.qualification || null,

        data.joining_date || null,

        data.salary || null,

        data.specialization || null,

        // ASSIGNMENT
        data.assignment_id || null,

        data.class_id || null,

        data.section_id || null,

        data.subject_id || null,

        data.academic_year_id || null,

        data.is_class_teacher || false,

      ]

    );

    return {

      success: true,
      message: "Teacher managed successfully",

    };

  } catch (error) {

    console.error("Error in manageTeacher:", error);

    throw new Error(
      error.message || "Something went wrong while managing teacher"
    );

  }
};

// =========================================
// GET TEACHERS
// =========================================

exports.getTeachers = async (teacherId = null) => {

  try {

    const query = `
      SELECT *
      FROM fn_get_teacher_details($1)
    `;

    const values = [teacherId];

    const result = await pool.query(query, values);

    return result.rows;

  } catch (error) {

    console.error("GET TEACHERS SERVICE ERROR:", error);

    throw new Error(
      error.message || "Something went wrong while fetching teachers"
    );

  }
};