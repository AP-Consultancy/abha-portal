const PaymentTransaction = require("../models/paymentTransaction");
const FeeCollection = require("../models/feeCollection");
const Student = require("../models/studentData");

// GET /api/accounts/transactions
// Admin: list recent financial transactions (income from payments). Expenses not implemented yet.
module.exports.getTransactions = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const match = {};
    if (startDate || endDate) {
      match.paymentDate = {};
      if (startDate) match.paymentDate.$gte = startDate;
      if (endDate) match.paymentDate.$lte = endDate;
    }

    const transactions = await PaymentTransaction.find(match)
      .sort({ paymentDate: -1 })
      .limit(limit)
      .populate("studentId", "firstName lastName scholarNumber")
      .populate("feeCollectionId", "receiptNumber");

    const mapped = transactions.map((t) => {
      const student = t.studentId;
      const fee = t.feeCollectionId;
      const studentName = student ? `${student.firstName || ""} ${student.lastName || ""}`.trim() : "";
      const receipt = fee?.receiptNumber ? `Receipt ${fee.receiptNumber}` : undefined;
      const isIncome = t.paymentStatus === "SUCCESS" && (t.amount || 0) > 0;
      return {
        id: String(t._id),
        date: (t.paymentDate || t.createdAt || new Date()).toISOString().substring(0, 10),
        type: isIncome ? "income" : "expense",
        category: isIncome ? "Fee Collection" : (t.paymentMethod || ""),
        description: isIncome
          ? `Fee payment${studentName ? ` by ${studentName}` : ""}`
          : (t.remarks || ""),
        amount: t.amount || 0,
        reference: receipt || t.transactionId || t.gatewayTransactionId || "",
        raw: {
          paymentMethod: t.paymentMethod,
          paymentGateway: t.paymentGateway,
          paymentStatus: t.paymentStatus,
        },
      };
    });

    return res.json({ transactions: mapped });
  } catch (error) {
    console.error("Error fetching account transactions:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


