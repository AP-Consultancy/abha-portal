// routes/student.routes.js

const express = require("express");
const router = express.Router();
const studentController = require("../controllers/student.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "TEACHER"),
  studentController.getStudents
);

router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("STUDENT"),
  studentController.getStudentProfile
);

// =========================================
// CREATE STUDENT
// ADMIN + TEACHER
// =========================================

router.post(
  "/manage",
  authMiddleware,
  roleMiddleware("ADMIN", "TEACHER"),
  studentController.manageStudent
);

// =========================================
// UPDATE STUDENT
// ADMIN + TEACHER
// =========================================

// router.put(
//   "/:id",
//   authMiddleware,
//   roleMiddleware("ADMIN", "TEACHER"),
//   studentController.manageStudent
// );

module.exports = router;
