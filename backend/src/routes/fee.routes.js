const express = require("express");
const router = express.Router();
const feeController = require("../controllers/fee.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

router.get(
  "/search/scholar/:scholarNumber",
  authMiddleware,
  roleMiddleware("ADMIN", "TEACHER"),
  feeController.searchByScholarNumber
);

router.get(
  "/:studentId",
  authMiddleware,
  feeController.getFeeDetails
);

router.post(
  "/mark-paid",
  authMiddleware,
  roleMiddleware("ADMIN", "TEACHER"),
  feeController.markPaid
);

router.post(
  "/structure/bulk-upload",
  authMiddleware,
  roleMiddleware("ADMIN", "TEACHER"),
  feeController.bulkUploadFeeStructure
);

router.post(
  "/structure",
  authMiddleware,
  roleMiddleware("ADMIN", "TEACHER"),
  feeController.saveFeeStructure
);

router.post(
  "/assign",
  authMiddleware,
  roleMiddleware("ADMIN", "TEACHER"),
  feeController.assignFeesToClass
);

router.post(
  "/generate",
  authMiddleware,
  roleMiddleware("ADMIN", "TEACHER"),
  feeController.generateFeeCollection
);

router.post(
  "/reset-student/:scholarNumber",
  authMiddleware,
  roleMiddleware("ADMIN", "TEACHER"),
  feeController.resetStudentToLatestStructure
);

module.exports = router;
