const express = require("express");

const router = express.Router();

const teacherController = require("../controllers/teacher.controller");

const authMiddleware = require("../middleware/auth.middleware");

const roleMiddleware = require("../middleware/role.middleware");

// CREATE / UPDATE / DELETE TEACHER
router.post(
  "/manage",
  authMiddleware,
  roleMiddleware("ADMIN"),
  teacherController.manageTeacher,
);

// GET ALL TEACHERS
router.get(
  "/",
  authMiddleware,
  teacherController.getTeachers
);

// GET SINGLE TEACHER
router.get(
  "/:id",
  authMiddleware,
  teacherController.getTeachers
);

module.exports = router;