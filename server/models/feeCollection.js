const mongoose = require("mongoose");

const feeCollectionSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true,
  },
  academicYear: String,
  term: { type: String },
  feeProfileType: {
    type: String,
    enum: ["NEW", "EXISTING"],
    default: "EXISTING",
  },
  feeComponents: [
    {
      componentName: String,
      category: String,
      frequency: String,
      monthsApplicable: Number,
      quartersApplicable: Number,
      halfYearsApplicable: Number,
      applicableFor: String,
      description: String,
      baseAmount: Number,
      amount: Number,
      dueDate: Date,
      isPaid: { type: Boolean, default: false },
      paidAmount: { type: Number, default: 0 },
      paidDate: Date,
    },
  ],
  totalAmount: Number,
  paidAmount: { type: Number, default: 0 },
  pendingAmount: Number,
  structureSnapshot: {
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
    },
    className: String,
    annualTotals: {
      newStudent: Number,
      existingStudent: Number,
    },
    monthlyRecurringFee: Number,
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PARTIAL", "PAID", "OVERDUE"],
    default: "PENDING",
  },
  dueDate: Date,
  lateFee: { type: Number, default: 0 },
  discount: {
    amount: { type: Number, default: 0 },
    reason: String,
    appliedBy: String,
  },
  paymentHistory: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, default: 'CASH' },
    receiptNumber: String,
    collectedBy: String,
    notes: String
  }],
  isActive: { type: Boolean, default: true },
});

feeCollectionSchema.index({ studentId: 1, academicYear: 1 });

module.exports = mongoose.model("FeeCollection", feeCollectionSchema);
