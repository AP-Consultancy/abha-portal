// models/FeeStructure.js
const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    academicYear: { type: String, required: true },
    class: { type: String, required: true },
    classDisplayName: String,
    feeComponents: [
      {
        componentName: { type: String, required: true },
        category: { type: String, default: "GENERAL" },
        amount: { type: Number, required: true, min: 0 },
        newStudentAmount: { type: Number, min: 0 },
        existingStudentAmount: { type: Number, min: 0 },
        frequency: {
          type: String,
          enum: ["MONTHLY", "QUARTERLY", "ANNUALLY", "ONE_TIME"],
          required: true,
        },
        monthsApplicable: { type: Number, min: 1, default: 12 },
        quartersApplicable: { type: Number, min: 1, default: 4 },
        halfYearsApplicable: { type: Number, min: 1, default: 2 },
        dueDate: { type: Number, required: true, min: 1, max: 31 },
        isOptional: { type: Boolean, default: false },
        applicableFor: {
          type: String,
          enum: ["ALL", "NEW", "EXISTING"],
          default: "ALL",
        },
        description: String,
      },
    ],
    totalAnnualFee: { type: Number, required: true, min: 0, default: 0 },
    annualTotals: {
      newStudent: { type: Number, default: 0 },
      existingStudent: { type: Number, default: 0 },
    },
    monthlyRecurringFee: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: String,
    lastModifiedBy: String,
  },
  { timestamps: true }
);

// Compound index for unique fee structure per class per year
feeStructureSchema.index({ academicYear: 1, class: 1 }, { unique: true });

feeStructureSchema.pre("save", function (next) {
  const getMultiplier = (component) => {
    if (component.frequency === "MONTHLY") return component.monthsApplicable || 12;
    if (component.frequency === "QUARTERLY") return component.quartersApplicable || 4;
    if (component.frequency === "HALF_YEARLY") return component.halfYearsApplicable || 2;
    return 1;
  };

  this.annualTotals = this.feeComponents.reduce(
    (totals, component) => {
      const multiplier = getMultiplier(component);
      const fallback = component.amount || 0;
      const newStudentAmount =
        component.applicableFor === "EXISTING"
          ? 0
          : (component.newStudentAmount ?? fallback) * multiplier;
      const existingStudentAmount =
        component.applicableFor === "NEW"
          ? 0
          : (component.existingStudentAmount ?? fallback) * multiplier;

      totals.newStudent += newStudentAmount;
      totals.existingStudent += existingStudentAmount;
      return totals;
    },
    { newStudent: 0, existingStudent: 0 }
  );

  this.monthlyRecurringFee = this.feeComponents.reduce((total, component) => {
    if (component.frequency !== "MONTHLY") return total;
    return total + (component.existingStudentAmount ?? component.amount ?? 0);
  }, 0);

  this.totalAnnualFee = Math.max(
    this.annualTotals.newStudent || 0,
    this.annualTotals.existingStudent || 0
  );
  next();
});

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
