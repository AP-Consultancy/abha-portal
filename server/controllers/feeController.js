const Student = require("../models/studentData");
const FeeStructure = require("../models/feeStructure");
const FeeCollection = require("../models/feeCollection");
// const PaymentTransaction = require("../models/paymentTransaction");
const mongoose = require("mongoose");
const { parseCSV } = require("../utils/csvUtils");
const fs = require("fs");
const {
  buildFeeCollectionFromStructure,
  buildFeeStructureSummary,
  buildStudentFeeDashboard,
  normalizeClassName,
  normalizeFeeComponent,
  normalizeFrequency,
  toNumber,
} = require("../utils/feeStructureUtils");

function buildFeeDetailsPayload(student, feeStructure, feeCollections) {
  const dashboard = buildStudentFeeDashboard({ student, feeStructure, feeCollections });
  const totalFee = feeCollections.reduce((sum, fee) => sum + (fee.totalAmount || 0), 0);
  const totalPaid = feeCollections.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
  const totalPending = feeCollections.reduce((sum, fee) => sum + (fee.pendingAmount || 0), 0);
  const totalLateFee = feeCollections.reduce((sum, fee) => sum + (fee.lateFee || 0), 0);

  return {
    student,
    feeStructure,
    feeCollections,
    structureBreakdown: {
      feeProfileType: dashboard.feeProfileType,
      totals: dashboard.structureTotals,
      components: dashboard.structureComponents,
    },
    componentLedger: dashboard.componentLedger,
    periodLedger: dashboard.periodLedger,
    overdueCollections: dashboard.overdueCollections,
    summary: {
      totalFee,
      totalPaid,
      totalPending,
      totalLateFee,
      totalDue: totalPending + totalLateFee,
    },
  };
}

exports.getFeeDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("Fetching fee details for studentId:", studentId);
    const student = await Student.findById(studentId);
    // console.log(student, "student  ------------------");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const normalizedClassName = normalizeClassName(student.className);
    const feeStructure = await FeeStructure.findOne({
      academicYear: student.academicYear,
      class: normalizedClassName,
      isActive: true,
    });
    // console.log(feeStructure, "feeStructure  ------------------");

    if (!feeStructure) {
      return res.status(404).json({
        message: "Fee structure not found for this class and academic year",
      });
    }

    const feeCollections = await FeeCollection.find({
      studentId,
      isActive: true,
    }).sort({ dueDate: 1 });

    res.json(buildFeeDetailsPayload(student, feeStructure, feeCollections));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching fee details", error: error.message });
  }
};

// Internal helper: assign active fee structure to all students in class/year
async function assignFeesForClass(academicYear, className, session) {
  const normalizedClassName = normalizeClassName(className);
  let fsQuery = FeeStructure.findOne({ academicYear, class: normalizedClassName, isActive: true });
  if (session) fsQuery = fsQuery.session(session);
  const feeStructure = await fsQuery;
  if (!feeStructure) return { assigned: 0, updated: 0, skippedWithPayments: 0 };

  let studentsQuery = Student.find({ academicYear });
  if (session) studentsQuery = studentsQuery.session(session);
  const students = (await studentsQuery).filter(
    (student) => normalizeClassName(student.className) === normalizedClassName
  );
  const now = new Date();
  let assigned = 0;
  let updated = 0;
  let skippedWithPayments = 0;
  for (const student of students) {
    let existingQuery = FeeCollection.findOne({
      studentId: student._id,
      academicYear,
      $or: [{ term: 'ANNUAL' }, { term: { $exists: false } }, { term: null }],
    });
    if (session) existingQuery = existingQuery.session(session);
    const existing = await existingQuery;
    const evaluated = buildFeeCollectionFromStructure(feeStructure, student, now);
    const snapshot = {
      feeStructureId: feeStructure._id,
      className: feeStructure.class,
      annualTotals: feeStructure.annualTotals,
      monthlyRecurringFee: feeStructure.monthlyRecurringFee,
    };

    if (!existing) {
      await FeeCollection.create([{
        receiptNumber: `RCPT${Date.now()}${Math.floor(Math.random()*1000)}`,
        studentId: student._id,
        academicYear,
        term: 'ANNUAL',
        feeProfileType: evaluated.feeProfileType,
        feeComponents: evaluated.feeComponents,
        totalAmount: evaluated.totalAmount,
        paidAmount: 0,
        pendingAmount: evaluated.totalAmount,
        structureSnapshot: snapshot,
        paymentStatus: 'PENDING',
        dueDate: evaluated.dueDate,
        isActive: true,
      }], session ? { session } : undefined);
      assigned++;
      continue;
    }

    if ((existing.paidAmount || 0) > 0 || (existing.paymentHistory || []).length > 0) {
      skippedWithPayments++;
      continue;
    }

    existing.feeProfileType = evaluated.feeProfileType;
    existing.feeComponents = evaluated.feeComponents;
    existing.totalAmount = evaluated.totalAmount;
    existing.paidAmount = 0;
    existing.pendingAmount = evaluated.totalAmount;
    existing.structureSnapshot = snapshot;
    existing.paymentStatus = 'PENDING';
    existing.dueDate = evaluated.dueDate;
    existing.lateFee = 0;
    await existing.save(session ? { session } : undefined);
    updated++;
  }
  return { assigned, updated, skippedWithPayments };
}

// Admin: create or update fee structure per class/year
exports.upsertFeeStructure = async (req, res) => {
  try {
    const { academicYear, className, feeComponents, isActive = true } = req.body;
    if (!academicYear || !className || !Array.isArray(feeComponents) || feeComponents.length === 0) {
      return res.status(400).json({ message: "academicYear, className, and feeComponents are required" });
    }
    const normalizedClass = normalizeClassName(className);
    const mapped = feeComponents.map((component) => normalizeFeeComponent(component));
    const summary = buildFeeStructureSummary(mapped);
    const doc = await FeeStructure.findOneAndUpdate(
      { academicYear, class: normalizedClass },
      {
        academicYear,
        class: normalizedClass,
        classDisplayName: className,
        feeComponents: mapped,
        annualTotals: {
          newStudent: summary.newStudentTotal,
          existingStudent: summary.existingStudentTotal,
        },
        monthlyRecurringFee: summary.monthlyRecurringFee,
        totalAnnualFee: Math.max(summary.newStudentTotal, summary.existingStudentTotal),
        isActive,
      },
      { new: true, upsert: true, runValidators: true }
    );
    // Auto-assign to existing students of the class/year
    const syncResult = await assignFeesForClass(academicYear, normalizedClass);
    return res.json({
      message: "Fee structure saved and student fee collections synchronized",
      syncResult,
      feeStructure: doc,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error saving fee structure", error: error.message });
  }
};

// Admin: bulk assign fee collections to all students of a class for the year
exports.assignFeesToClass = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { academicYear, className } = req.body;
    if (!academicYear || !className) {
      return res.status(400).json({ message: "academicYear and className are required" });
    }
    const normalizedClass = normalizeClassName(className);
    const syncResult = await assignFeesForClass(academicYear, normalizedClass, session);
    await session.commitTransaction();
    return res.json({ message: `Fees synchronized for class ${normalizedClass}`, ...syncResult });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ message: "Error assigning fees", error: error.message });
  } finally {
    session.endSession();
  }
};

// Admin: bulk upload fee structures via CSV
exports.bulkUploadFeeStructure = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    const rows = await parseCSV(req.file.path);
    const required = ["academicyear", "class", "componentname"];

    // normalize and group
    const sanitize = (s) => String(s || "").trim();
    const groupMap = new Map(); // key: year|class -> components[]

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const r = {};
      for (const [k, v] of Object.entries(raw)) {
        const key = String(k).toLowerCase().replace(/[^a-z0-9]/g, "");
        r[key] = sanitize(v);
      }
      const missing = required.filter((f) => !r[f]);
      if (missing.length) {
        continue; // skip invalid rows silently (or collect errors if needed)
      }
      const year = r.academicyear;
      const cls = normalizeClassName(r.class);
      const key = `${year}|${cls}`;
      const arr = groupMap.get(key) || [];
      const hasBaseAmount = r.amount !== "";
      const hasNewAmount = r.newstudentamount !== "";
      const hasExistingAmount = r.existingstudentamount !== "";
      if (!hasBaseAmount && !hasNewAmount && !hasExistingAmount) {
        continue;
      }

      arr.push(normalizeFeeComponent({
        componentName: r.componentname,
        category: r.category,
        amount: hasBaseAmount ? r.amount : (r.newstudentamount || r.existingstudentamount || 0),
        newStudentAmount: hasNewAmount ? r.newstudentamount : undefined,
        existingStudentAmount: hasExistingAmount ? r.existingstudentamount : undefined,
        frequency: normalizeFrequency(r.frequency || "ANNUALLY"),
        monthsApplicable: r.monthsapplicable || 12,
        quartersApplicable: r.quartersapplicable || 4,
        halfYearsApplicable: r.halfyearsapplicable || 2,
        dueDate: r.dueday || 15,
        applicableFor: r.applicablefor || "ALL",
        isOptional: r.isoptional === "true" || r.isoptional === "1",
        description: r.description || "",
      }));
      groupMap.set(key, arr);
    }

    let upserts = 0;
    const assignments = [];
    for (const [key, components] of groupMap.entries()) {
      const [academicYear, className] = key.split("|");
      const summary = buildFeeStructureSummary(components);
      await FeeStructure.findOneAndUpdate(
        { academicYear, class: className },
        {
          academicYear,
          class: className,
          classDisplayName: className,
          feeComponents: components,
          annualTotals: {
            newStudent: summary.newStudentTotal,
            existingStudent: summary.existingStudentTotal,
          },
          monthlyRecurringFee: summary.monthlyRecurringFee,
          totalAnnualFee: Math.max(summary.newStudentTotal, summary.existingStudentTotal),
          isActive: true,
        },
        { upsert: true, new: true, runValidators: true }
      );
      const syncResult = await assignFeesForClass(academicYear, className);
      assignments.push({ academicYear, className, ...syncResult });
      upserts++;
    }

    try { fs.unlinkSync(req.file.path); } catch (_) {}
    return res.json({ message: "Bulk fee structure upload completed and student fee collections synchronized", updated: upserts, assignments });
  } catch (error) {
    // cleanup file
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    return res.status(500).json({ message: "Error processing CSV", error: error.message });
  }
};


//removal of the following
exports.generateFeeCollection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { studentId, term, feeComponents, dueDate } = req.body;

    const student = await Student.findById(studentId).session(session);
    if (!student) {
      throw new Error("Student not found");
    }

    const normalizedComponents = (feeComponents || []).map((component) => ({
      ...normalizeFeeComponent(component),
      frequency: normalizeFrequency(component.frequency),
      monthsApplicable: toNumber(component.monthsApplicable, 12),
      quartersApplicable: toNumber(component.quartersApplicable, 4),
      halfYearsApplicable: toNumber(component.halfYearsApplicable, 2),
      baseAmount: toNumber(component.amount),
      amount: toNumber(component.amount),
    }));
    const totalAmount = normalizedComponents.reduce((sum, component) => sum + component.amount, 0);

    const feeCollection = new FeeCollection({
      receiptNumber: `RCPT${Date.now()}${Math.floor(Math.random()*1000)}`,
      studentId,
      academicYear: student.academicYear,
      term,
      feeProfileType: student.feeProfileType || "EXISTING",
      feeComponents: normalizedComponents.map((comp) => ({
        ...comp,
        dueDate: new Date(comp.dueDate || dueDate),
      })),
      totalAmount,
      paidAmount: 0,
      pendingAmount: totalAmount,
      dueDate: new Date(dueDate),
      paymentStatus: 'PENDING',
      isActive: true,
    });

    await feeCollection.save({ session });
    await session.commitTransaction();

    res.status(201).json(feeCollection);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      message: "Error generating fee collection",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.updateLateFees = async (req, res) => {
  try {
    const overdueCollections = await FeeCollection.find({
      dueDate: { $lt: new Date() },
      paymentStatus: { $in: ["PENDING", "PARTIAL"] },
      isActive: true,
    });

    const updates = [];
    const currentDate = new Date();

    for (const collection of overdueCollections) {
      const daysOverdue = Math.floor(
        (currentDate - collection.dueDate) / (1000 * 60 * 60 * 24)
      );
      const lateFeePerDay = 10; // ₹10 per day
      const calculatedLateFee = daysOverdue * lateFeePerDay;

      if (calculatedLateFee !== collection.lateFee) {
        updates.push({
          updateOne: {
            filter: { _id: collection._id },
            update: {
              lateFee: calculatedLateFee,
              paymentStatus: "OVERDUE",
            },
          },
        });
      }
    }

    if (updates.length > 0) {
      await FeeCollection.bulkWrite(updates);
    }

    res.json({
      message: `Updated late fees for ${updates.length} collections`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating late fees", error: error.message });
  }
};

// Mark fees as paid (with partial payment support)
exports.markFeesAsPaid = async (req, res) => {
  try {
    const { studentId, feeCollectionId, amount, paymentMethod = 'CASH', receiptNumber } = req.body;
    
    if (!studentId || !feeCollectionId) {
      return res.status(400).json({ message: "Student ID and Fee Collection ID are required" });
    }

    // Find the fee collection
    const feeCollection = await FeeCollection.findById(feeCollectionId);
    if (!feeCollection) {
      return res.status(404).json({ message: "Fee collection not found" });
    }

    // Verify the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Calculate payment details
    const pendingAmount = feeCollection.pendingAmount || 0;
    const lateFee = feeCollection.lateFee || 0;
    const totalPending = pendingAmount + lateFee;
    
    // If no amount specified, mark as fully paid
    const paymentAmount = amount ? Number(amount) : totalPending;
    
    if (paymentAmount <= 0) {
      return res.status(400).json({ message: "Payment amount must be greater than 0" });
    }

    if (paymentAmount > totalPending) {
      return res.status(400).json({ message: "Payment amount cannot exceed pending amount" });
    }

    // Update fee collection
    const newPaidAmount = (feeCollection.paidAmount || 0) + paymentAmount;
    const newPendingAmount = Math.max(0, totalPending - paymentAmount);
    
    // Determine new payment status
    let newPaymentStatus = 'PARTIAL';
    if (newPendingAmount === 0) {
      newPaymentStatus = 'PAID';
    } else if (newPendingAmount > 0) {
      newPaymentStatus = 'PARTIAL';
    }

    let remainingAmount = paymentAmount;
    for (const component of feeCollection.feeComponents) {
      const componentPaidAmount = component.paidAmount || 0;
      const componentPending = Math.max(0, (component.amount || 0) - componentPaidAmount);
      if (componentPending <= 0 || remainingAmount <= 0) continue;

      const paymentForComponent = Math.min(remainingAmount, componentPending);
      component.paidAmount = componentPaidAmount + paymentForComponent;
      component.isPaid = component.paidAmount >= (component.amount || 0);
      if (component.isPaid) {
        component.paidDate = new Date();
      }
      remainingAmount -= paymentForComponent;
    }

    feeCollection.paidAmount = newPaidAmount;
    feeCollection.pendingAmount = newPendingAmount;
    feeCollection.paymentStatus = newPaymentStatus;
    feeCollection.paymentHistory.push({
      amount: paymentAmount,
      date: new Date(),
      method: paymentMethod,
      receiptNumber: receiptNumber || `RCPT${Date.now()}`,
      collectedBy: req.user?.id || 'admin'
    });

    await feeCollection.save();
    const updatedFeeCollection = feeCollection.toObject();

    // Create payment transaction record
    try {
      const PaymentTransaction = require("../models/paymentTransaction");
      const paymentTransaction = new PaymentTransaction({
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        studentId,
        feeCollectionId,
        amount: paymentAmount,
        paymentMethod,
        paymentGateway: 'MANUAL',
        paymentStatus: 'SUCCESS',
        processedBy: req.user?.id || 'admin',
        remarks: `Marked as paid via admin panel - Receipt: ${receiptNumber || `RCPT${Date.now()}`}`
      });
      
      console.log('Creating payment transaction:', {
        transactionId: paymentTransaction.transactionId,
        studentId,
        feeCollectionId,
        amount: paymentAmount,
        paymentMethod,
        paymentGateway: 'MANUAL'
      });
      
      await paymentTransaction.save();
      console.log('Payment transaction saved successfully');
    } catch (transactionError) {
      console.error('Error creating payment transaction:', transactionError);
      // Continue with the response even if transaction creation fails
    }

    res.json({
      message: "Fees marked as paid successfully",
      feeCollection: updatedFeeCollection,
      summary: {
        previousPending: totalPending,
        paymentAmount,
        newPending: newPendingAmount,
        newStatus: newPaymentStatus
      }
    });

  } catch (error) {
    console.error('Error marking fees as paid:', error);
    res.status(500).json({ 
      message: "Error marking fees as paid", 
      error: error.message 
    });
  }
};

// Search student by scholar number
exports.searchStudentByScholarNumber = async (req, res) => {
  try {
    const { scholarNumber } = req.params;
    
    if (!scholarNumber) {
      return res.status(400).json({ message: "Scholar number is required" });
    }

    // Search for student by scholar number
    const student = await Student.findOne({ 
      scholarNumber: { $regex: scholarNumber, $options: 'i' } 
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found with this scholar number" });
    }

    // Get fee details for the student
    const normalizedClassName = normalizeClassName(student.className);
    const feeStructure = await FeeStructure.findOne({
      academicYear: student.academicYear,
      class: normalizedClassName,
      isActive: true,
    });

    const feeCollections = await FeeCollection.find({
      studentId: student._id,
      isActive: true,
    }).sort({ dueDate: 1 });

    res.json(buildFeeDetailsPayload(student, feeStructure, feeCollections));

  } catch (error) {
    console.error('Error searching student by scholar number:', error);
    res.status(500).json({ 
      message: "Error searching student", 
      error: error.message 
    });
  }
};
