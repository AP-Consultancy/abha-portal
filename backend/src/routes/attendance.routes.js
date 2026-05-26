const express = require("express");

const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");

const authMiddleware = require("../middleware/auth.middleware");

const roleMiddleware = require("../middleware/role.middleware");

// ============================================
// MANAGE ATTENDANCE
// ============================================

router.post(
  "/manage",
  authMiddleware,
  roleMiddleware("ADMIN", "TEACHER"),
  attendanceController.manageAttendance
);

// ============================================
// GET ALL ATTENDANCE
// ============================================

router.get(
  "/",
  authMiddleware,
  attendanceController.getAttendance
);

// ============================================
// GET SINGLE ATTENDANCE
// ============================================

router.get(
  "/:id",
  authMiddleware,
  attendanceController.getAttendance
);

module.exports = router;