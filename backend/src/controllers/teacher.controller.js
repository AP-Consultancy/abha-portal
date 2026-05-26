const teacherService = require("../services/teacher.service");

// ============================================
// MANAGE TEACHER
// ============================================

const manageTeacher = async (req, res) => {

  try {

    const result = await teacherService.manageTeacher(req.body);

    return res.status(200).json({
      success: true,
      message: "Teacher managed successfully",
      data: result,
    });

  } catch (error) {

    console.error("MANAGE TEACHER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET TEACHERS
// ============================================

const getTeachers = async (req, res) => {

  try {

    const teacherId = req.params.id || null;

    const teachers = await teacherService.getTeachers(teacherId);

    return res.status(200).json({
      success: true,
      message: "Teacher details fetched successfully",
      data: teachers,
    });

  } catch (error) {

    console.error("GET TEACHERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  manageTeacher,
  getTeachers,
};