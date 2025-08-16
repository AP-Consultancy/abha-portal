const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const accountsController = require("../controllers/accountsController");

// Admin accounts endpoints
router.get("/transactions", authenticateToken, requireAdmin, accountsController.getTransactions);

module.exports = router;


