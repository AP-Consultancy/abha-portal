require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/auth.routes");
const teacherRoutes = require("./src/routes/teacher.routes");
const studentRoutes = require("./src/routes/student.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const feeRoutes = require("./src/routes/fee.routes");
const studentReportRoutes = require("./src/routes/studentReport.routes");
const attendanceRoutes = require("./src/routes/attendance.routes");

const app = express();


// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HEALTH CHECK API
app.get("/", (req, res) => {

    return res.status(200).json({
        success: true,
        message: "School Management API Running Successfully"
    });

});


// TEST API
app.get("/api/test", (req, res) => {

    return res.status(200).json({
        success: true,
        message: "Test API Working"
    });

});
app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/students", studentReportRoutes);
app.use("/api/attendance", attendanceRoutes);
// 404 ROUTE HANDLER
app.use((req, res) => {

    return res.status(404).json({
        success: false,
        message: "Route Not Found"
    });

});


// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {

    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });

});


module.exports = app;
