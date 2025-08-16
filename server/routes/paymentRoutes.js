const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyAndRecordPayment,
  getTransactionHistory,
  processRefund,
  markAsPaidManual,
} = require("../controllers/paymentController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Students can create orders and verify payments
router.post("/create-order", authenticateToken, createOrder);
router.post("/verify", authenticateToken, verifyAndRecordPayment);

// Students can view their own transaction history, admins can view any student's
router.get("/transactions/:studentId", authenticateToken, getTransactionHistory);

// Only admins can process refunds
router.post("/refund", authenticateToken, requireAdmin, processRefund);

// Admin can mark a fee collection as paid (offline/manual)
router.post("/mark-paid", authenticateToken, requireAdmin, markAsPaidManual);

module.exports = router;
