const feeService = require("../services/fee.service");

const handleError = (res, error) => {
  const status = error.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: error.message,
  });
};

exports.getFeeDetails = async (req, res) => {
  try {
    const feeData = await feeService.getFeeDetails(req.params.studentId);
    return res.status(200).json({
      success: true,
      ...feeData,
    });
  } catch (error) {
    console.error("Get Fee Details Error:", error);
    return handleError(res, error);
  }
};

exports.searchByScholarNumber = async (req, res) => {
  try {
    const feeData = await feeService.searchByScholarNumber(
      req.params.scholarNumber
    );
    return res.status(200).json({
      success: true,
      ...feeData,
    });
  } catch (error) {
    console.error("Fee Scholar Search Error:", error);
    return handleError(res, error);
  }
};

exports.markPaid = async (req, res) => {
  try {
    const result = await feeService.markPaid({
      ...req.body,
      received_by: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Payment marked successfully",
      ...result,
    });
  } catch (error) {
    console.error("Mark Fee Paid Error:", error);
    return handleError(res, error);
  }
};

exports.saveFeeStructure = async (req, res) => {
  try {
    const result = await feeService.saveFeeStructure(req.body);
    return res.status(200).json({
      success: true,
      message: "Fee structure saved successfully",
      ...result,
    });
  } catch (error) {
    console.error("Save Fee Structure Error:", error);
    return handleError(res, error);
  }
};

exports.bulkUploadFeeStructure = async (req, res) => {
  try {
    const result = await feeService.bulkUploadFeeStructure();
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Bulk Upload Fee Structure Error:", error);
    return handleError(res, error);
  }
};

exports.assignFeesToClass = async (req, res) => {
  try {
    const result = await feeService.assignFeesToClass(req.body);
    return res.status(200).json({
      success: true,
      message: "Fees assigned successfully",
      ...result,
    });
  } catch (error) {
    console.error("Assign Fees Error:", error);
    return handleError(res, error);
  }
};

exports.generateFeeCollection = async (req, res) => {
  try {
    const result = await feeService.generateFeeCollection(req.body);
    return res.status(200).json({
      success: true,
      message: "Fee collection generated successfully",
      ...result,
    });
  } catch (error) {
    console.error("Generate Fee Collection Error:", error);
    return handleError(res, error);
  }
};

exports.resetStudentToLatestStructure = async (req, res) => {
  try {
    const result = await feeService.resetStudentToLatestStructure(
      req.params.scholarNumber
    );
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Reset Student Fee Structure Error:", error);
    return handleError(res, error);
  }
};
