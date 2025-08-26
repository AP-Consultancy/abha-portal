const express = require("express");
const router = express.Router();
const homeworkController = require("../controllers/homeworkController");
const { authenticateToken, requireAdmin, requireTeacher } = require("../middleware/auth");

router.post("/", authenticateToken, requireTeacher, homeworkController.createHomework);
router.get("/", authenticateToken, homeworkController.getAllHomework);
router.get("/:id", authenticateToken, homeworkController.getHomework);
router.put("/:id", authenticateToken, requireTeacher, homeworkController.updateHomework);
router.delete("/:id", authenticateToken, requireTeacher, homeworkController.deleteHomework);
router.get("/class/:id", authenticateToken, homeworkController.getHomeworkByClass);
router.get("/student/:className/:section", authenticateToken, homeworkController.getHomeworkForStudent);

router.get("/teacher/:teacherId", authenticateToken, homeworkController.getHomeworkByTeacher);
router.get("/health", homeworkController.healthCheck);
router.get("/test", homeworkController.testBasicHomework);
router.get("/test/response", homeworkController.testResponseStructure);

module.exports = router;