const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// Admin dashboard summary
router.get("/dashboard", authenticateToken, requireAdmin, adminController.getDashboardSummary);

// Admin password management
router.post("/change-password", authenticateToken, requireAdmin, adminController.changeOwnPassword);
router.post("/change-user-password", authenticateToken, requireAdmin, adminController.changeUserPassword);

module.exports = router;

