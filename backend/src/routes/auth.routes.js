const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// LOGIN API
router.post("/login",authController.login);

module.exports = router;