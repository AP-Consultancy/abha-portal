// controllers/student.controller.js

const studentService = require("../services/student.service");

exports.getStudents = async (req, res) => {
  try {
    const students = await studentService.getStudents();

    return res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Get Students Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const student = await studentService.getStudentByUserId(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Student Profile Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.manageStudent = async (req, res) => {
  try {
    // GET ACTION
    const action = Number(req.body.action);

    // VALIDATE ACTION
    if (![1, 2, 3].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 1(Create), 2(Update), 3(Delete)",
      });
    }
    // PREPARE PAYLOAD
    const payload = {
      ...req.body,
      action,
      student_id: req.body.student_id
        ? Number(req.body.student_id)
        : null,

      user_id: req.body.user_id
        ? Number(req.body.user_id)
        : null,

      updated_by: req.user?.id || null,
    };

    console.log("Student Payload:", payload);

    const response = await studentService.manageStudent(payload);

    let message = "";

    switch (action) {
      case 1:
        message = "Student created successfully";
        break;

      case 2:
        message = "Student updated successfully";
        break;

      case 3:
        message = "Student deleted successfully";
        break;
    }

    return res.status(200).json({
      success: true,
      message,
      data: response || null,
    });

  } catch (error) {

    console.error("Student Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
