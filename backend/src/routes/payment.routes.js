const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// MANAGE PAYMENT
router.post(
    "/manage",
    authMiddleware,
    roleMiddleware("ADMIN", "TEACHER"),
    paymentController.managePayment
);
module.exports = router;