const express = require("express");

const  router = express.Router();

const studentReportController =
require("../controllers/studentReport.controller");

const authMiddleware =
require("../middleware/auth.middleware");

const roleMiddleware =
require("../middleware/role.middleware");


// =============================================
// GET STUDENT REPORT
// =============================================

router.get(
    "/report",
    authMiddleware,
    roleMiddleware("ADMIN", "TEACHER"),
    studentReportController.getStudentsReport

);

module.exports = router;
