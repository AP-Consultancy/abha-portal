const attendanceService = require("../services/attendance.service");

// ============================================
// GET ATTENDANCE
// ============================================

const getAttendance = async (req, res) => {

  try {

    const attendanceId = req.params.id || null;

    const studentId = req.query.student_id || null;

    const attendance =
      await attendanceService.getAttendance(
        attendanceId,
        studentId
      );

    return res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      data: attendance,
    });

  } catch (error) {

    console.error("GET ATTENDANCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ============================================
// MANAGE ATTENDANCE
// ============================================

const manageAttendance = async (req, res) => {

  try {

    const result =
      await attendanceService.manageAttendance(
        req.body
      );

    return res.status(200).json({

      success: true,

      message: result.message,

      data: result,

    });

  } catch (error) {

    console.error(
      "MANAGE ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Internal Server Error",

      error: error.message,

    });
  }
};

module.exports = {
  manageAttendance,
  getAttendance,
};


