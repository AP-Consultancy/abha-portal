const studentReportService = require("../services/studentReport.service");

exports.getStudentsReport = async (req,res) => {

    try {
        // GET QUERY PARAMS
        const {
            class_id,
            section_id,
            academic_year_id
        } = req.query;

        // CALL SERVICE
        const result = await studentReportService.getStudentsReport( class_id,section_id,academic_year_id);
        
        // RESPONSE
        return res.status(200).json({
            success: true,
            total: result.length,
            data: result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }

};
