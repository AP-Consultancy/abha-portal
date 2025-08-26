const homeworkService = require("../services/homeworkService");
const { success, error } = require("../utils/response");

exports.createHomework = async (req, res) => {
    try {
        const homework = await homeworkService.createHomework(req.body);
        return success(res, "Homework created successfully", homework);
    } catch (err) {
        return error(res, "Failed to create homework", err.message);
    }
}

exports.getHomework = async (req, res) => {
    try {
        const homework = await homeworkService.getHomework(req.params.id);
        return success(res, "Homework fetched successfully", homework);
    } catch (err) {
        return error(res, "Failed to fetch homework", err.message);
    }
}

exports.updateHomework = async (req, res) => {
    try {
        const homework = await homeworkService.updateHomework(req.params.id, req.body);
        return success(res, "Homework updated successfully", homework);
    } catch (err) {
        return error(res, "Failed to update homework", err.message);
    }
}

exports.deleteHomework = async (req, res) => {
    try {
        await homeworkService.deleteHomework(req.params.id);
        return success(res, "Homework deleted successfully");
    } catch (err) {
        return error(res, "Failed to delete homework", err.message);
    }
}

exports.getHomeworkByClass = async (req, res) => {
    try {
        console.log('getHomeworkByClass called with classId:', req.params.classId);
        const homework = await homeworkService.getHomeworkByClass(req.params.classId);
        console.log('getHomeworkByClass result:', homework);
        console.log('getHomeworkByClass result type:', typeof homework);
        console.log('getHomeworkByClass result isArray:', Array.isArray(homework));
        if (Array.isArray(homework) && homework.length > 0) {
            console.log('First homework record for class:', {
                id: homework[0]._id,
                title: homework[0].title,
                teacherId: homework[0].teacherId,
                classId: homework[0].classId,
                subjectId: homework[0].subjectId
            });
        }
        return success(res, "Homework fetched successfully", homework);
    } catch (err) {
        console.error('getHomeworkByClass error:', err);
        return error(res, "Failed to fetch homework", err.message);
    }
}

exports.getAllHomework = async (req, res) => {
    try {
        console.log('getAllHomework called');
        const homework = await homeworkService.getAllHomework();
        console.log('getAllHomework result:', homework);
        console.log('getAllHomework result type:', typeof homework);
        console.log('getAllHomework result isArray:', Array.isArray(homework));
        if (Array.isArray(homework) && homework.length > 0) {
            console.log('First homework record:', {
                id: homework[0]._id,
                title: homework[0].title,
                teacherId: homework[0].teacherId,
                classId: homework[0].classId,
                subjectId: homework[0].subjectId
            });
        }
        return success(res, "All homework fetched successfully", homework);
    } catch (err) {
        console.error('getAllHomework error:', err);
        return error(res, "Failed to fetch homework", err.message);
    }
}

exports.getHomeworkByTeacher = async (req, res) => {
    try {
        const homework = await homeworkService.getHomeworkByTeacher(req.params.teacherId);
        return success(res, "Homework fetched successfully", homework);
    } catch (err) {
        return error(res, "Failed to fetch homework", err.message);
    }
}

// Health check endpoint for homework
exports.healthCheck = async (req, res) => {
    try {
        // Just try to count homework records
        const count = await require("../models/homeworkModel").countDocuments();
        return success(res, "Homework service is healthy", { count });
    } catch (err) {
        console.error('Homework health check failed:', err);
        return error(res, "Homework service health check failed", err.message);
    }
}

// Simple test endpoint without population
exports.testBasicHomework = async (req, res) => {
    try {
        console.log('Testing basic homework functionality...');
        const homework = await require("../models/homeworkModel").find().limit(5);
        console.log(`Found ${homework.length} homework records`);
        
        // Return raw data for debugging
        return res.json({
            success: true,
            message: "Basic homework query successful",
            count: homework.length,
            rawData: homework,
            sample: homework.map(h => ({ 
                id: h._id, 
                title: h.title,
                teacherId: h.teacherId,
                classId: h.classId,
                subjectId: h.subjectId,
                deadline: h.deadline
            }))
        });
    } catch (err) {
        console.error('Basic homework test failed:', err);
        return error(res, "Basic homework test failed", err.message);
    }
}

// Get homework for a student by class name and section
exports.getHomeworkForStudent = async (req, res) => {
    try {
        const { className, section } = req.params;
        console.log('getHomeworkForStudent called with:', { className, section });
        
        if (!className || !section) {
            return error(res, "Class name and section are required", "Missing parameters");
        }
        
        // First find the class that matches the student's class name and section
        const Class = require("../models/classModel");
        const classDoc = await Class.findOne({ name: className, section: section });
        
        if (!classDoc) {
            console.log('No class found for:', { className, section });
            return success(res, "No class found for student", []);
        }
        
        console.log('Found class:', classDoc._id);
        
        // Now get homework for that class
        const homework = await homeworkService.getHomeworkByClass(classDoc._id);
        console.log('Found homework for student:', homework.length);
        
        return success(res, "Homework fetched successfully for student", homework);
    } catch (err) {
        console.error('getHomeworkForStudent error:', err);
        return error(res, "Failed to fetch homework for student", err.message);
    }
}

// Test endpoint to show response structure
exports.testResponseStructure = async (req, res) => {
    try {
        console.log('Testing response structure...');
        const homework = await homeworkService.getAllHomework();
        console.log('getAllHomework result:', homework);
        
        // Return both the raw result and the formatted response
        const rawResult = homework;
        const formattedResponse = success(res, "Response structure test", homework);
        
        return res.json({
            success: true,
            message: "Response structure test",
            rawResult: rawResult,
            rawResultType: typeof rawResult,
            rawResultIsArray: Array.isArray(rawResult),
            rawResultLength: Array.isArray(rawResult) ? rawResult.length : 'N/A',
            formattedResponse: formattedResponse,
            note: "This shows what getAllHomework returns vs what gets sent to client"
        });
    } catch (err) {
        console.error('Response structure test failed:', err);
        return error(res, "Response structure test failed", err.message);
    }
}



