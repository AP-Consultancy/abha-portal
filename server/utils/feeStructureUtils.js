const CLASS_ALIASES = {
  "nur": "Nursery",
  "nur.": "Nursery",
  "nursery": "Nursery",
  "kg1": "KG1",
  "k.g.1": "KG1",
  "k g 1": "KG1",
  "lkg": "KG1",
  "kg2": "KG2",
  "k.g.2": "KG2",
  "k g 2": "KG2",
  "ukg": "KG2",
  "1": "1",
  "1st": "1",
  "2": "2",
  "2nd": "2",
  "3": "3",
  "3rd": "3",
  "4": "4",
  "4th": "4",
  "5": "5",
  "5th": "5",
  "6": "6",
  "6th": "6",
  "7": "7",
  "7th": "7",
  "8": "8",
  "8th": "8",
  "9": "9",
  "9th": "9",
  "10": "10",
  "10th": "10",
  "11": "11",
  "11th": "11",
  "12": "12",
  "12th": "12",
};

const DEFAULT_FREQUENCY = "ANNUALLY";
const VALID_FREQUENCIES = ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "ANNUALLY", "ONE_TIME"];
const VALID_APPLICABILITY = ["ALL", "NEW", "EXISTING"];

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const normalized = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(normalized) ? normalized : fallback;
}

function sanitizeText(value = "") {
  return String(value).trim();
}

function normalizeClassName(value = "") {
  const raw = sanitizeText(value);
  const key = raw.toLowerCase().replace(/\s+/g, " ");
  return CLASS_ALIASES[key] || raw;
}

function normalizeFrequency(value, fallback = DEFAULT_FREQUENCY) {
  const frequency = sanitizeText(value).toUpperCase();
  return VALID_FREQUENCIES.includes(frequency) ? frequency : fallback;
}

function normalizeApplicability(value = "ALL") {
  const applicability = sanitizeText(value).toUpperCase();
  return VALID_APPLICABILITY.includes(applicability) ? applicability : "ALL";
}

function getAcademicYearStart(academicYear = "") {
  const match = String(academicYear).match(/(\d{4})/);
  return match ? Number(match[1]) : null;
}

function deriveStudentFeeProfile(student = {}) {
  if (student.feeProfileType === "NEW" || student.feeProfileType === "EXISTING") {
    return student.feeProfileType;
  }

  const academicYearStart = getAcademicYearStart(student.academicYear);
  const admissionDate = student.admissionDate ? new Date(student.admissionDate) : null;
  if (!academicYearStart || !admissionDate || Number.isNaN(admissionDate.getTime())) {
    return "EXISTING";
  }

  return admissionDate.getFullYear() >= academicYearStart ? "NEW" : "EXISTING";
}

function getChargeMultiplier(component = {}) {
  const frequency = normalizeFrequency(component.frequency);
  if (frequency === "MONTHLY") {
    return Math.max(1, toNumber(component.monthsApplicable, 12));
  }
  if (frequency === "QUARTERLY") {
    return Math.max(1, toNumber(component.quartersApplicable, 4));
  }
  if (frequency === "HALF_YEARLY") {
    return Math.max(1, toNumber(component.halfYearsApplicable, 2));
  }
  return 1;
}

function getBaseAmountForProfile(component = {}, feeProfileType = "EXISTING") {
  if (feeProfileType === "NEW" && component.newStudentAmount !== undefined && component.newStudentAmount !== null) {
    return toNumber(component.newStudentAmount, toNumber(component.amount));
  }
  if (feeProfileType === "EXISTING" && component.existingStudentAmount !== undefined && component.existingStudentAmount !== null) {
    return toNumber(component.existingStudentAmount, toNumber(component.amount));
  }
  return toNumber(component.amount);
}

function isComponentApplicable(component = {}, feeProfileType = "EXISTING") {
  const applicability = normalizeApplicability(component.applicableFor);
  if (applicability === "ALL") return true;
  if (applicability === "NEW") return feeProfileType === "NEW";
  if (applicability === "EXISTING") return feeProfileType === "EXISTING";
  return true;
}

function getAnnualAmountForProfile(component = {}, feeProfileType = "EXISTING") {
  if (!isComponentApplicable(component, feeProfileType)) return 0;
  return getBaseAmountForProfile(component, feeProfileType) * getChargeMultiplier(component);
}

function buildFeeStructureSummary(feeComponents = []) {
  const newStudentTotal = feeComponents.reduce(
    (sum, component) => sum + getAnnualAmountForProfile(component, "NEW"),
    0
  );
  const existingStudentTotal = feeComponents.reduce(
    (sum, component) => sum + getAnnualAmountForProfile(component, "EXISTING"),
    0
  );
  const monthlyRecurringFee = feeComponents.reduce((sum, component) => {
    if (normalizeFrequency(component.frequency) !== "MONTHLY") return sum;
    return sum + getBaseAmountForProfile(component, "EXISTING");
  }, 0);

  return {
    newStudentTotal,
    existingStudentTotal,
    monthlyRecurringFee,
  };
}

function normalizeFeeComponent(component = {}) {
  return {
    componentName: sanitizeText(component.componentName),
    category: sanitizeText(component.category || "GENERAL"),
    amount: toNumber(component.amount),
    newStudentAmount:
      component.newStudentAmount === "" || component.newStudentAmount === undefined
        ? undefined
        : toNumber(component.newStudentAmount),
    existingStudentAmount:
      component.existingStudentAmount === "" || component.existingStudentAmount === undefined
        ? undefined
        : toNumber(component.existingStudentAmount),
    frequency: normalizeFrequency(component.frequency),
    monthsApplicable: Math.max(1, toNumber(component.monthsApplicable, 12)),
    quartersApplicable: Math.max(1, toNumber(component.quartersApplicable, 4)),
    halfYearsApplicable: Math.max(1, toNumber(component.halfYearsApplicable, 2)),
    dueDate: Math.min(31, Math.max(1, toNumber(component.dueDate, 15))),
    isOptional: Boolean(component.isOptional),
    applicableFor: normalizeApplicability(component.applicableFor),
    description: sanitizeText(component.description),
  };
}

function buildFeeCollectionFromStructure(feeStructure, student, referenceDate = new Date()) {
  const feeProfileType = deriveStudentFeeProfile(student);
  const feeComponents = (feeStructure.feeComponents || [])
    .filter((component) => isComponentApplicable(component, feeProfileType))
    .map((component) => {
      const baseAmount = getBaseAmountForProfile(component, feeProfileType);
      const annualAmount = getAnnualAmountForProfile(component, feeProfileType);

      return {
        componentName: component.componentName,
        category: component.category,
        frequency: component.frequency,
        monthsApplicable: component.monthsApplicable,
        quartersApplicable: component.quartersApplicable,
        halfYearsApplicable: component.halfYearsApplicable,
        applicableFor: component.applicableFor,
        description: component.description,
        baseAmount,
        amount: annualAmount,
        dueDate: new Date(
          referenceDate.getFullYear(),
          referenceDate.getMonth(),
          toNumber(component.dueDate, 15)
        ),
        isPaid: false,
        paidAmount: 0,
      };
    });

  const totalAmount = feeComponents.reduce((sum, component) => sum + component.amount, 0);

  return {
    feeProfileType,
    feeComponents,
    totalAmount,
    dueDate: new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 15),
  };
}

function buildStudentFeeDashboard({ student, feeStructure, feeCollections }) {
  const feeProfileType = deriveStudentFeeProfile(student);
  const safeCollections = Array.isArray(feeCollections) ? feeCollections : [];
  const structureComponents = (feeStructure?.feeComponents || []).map((component) => {
    const annualAmount = getAnnualAmountForProfile(component, feeProfileType);
    const baseAmount = getBaseAmountForProfile(component, feeProfileType);
    return {
      componentName: component.componentName,
      category: component.category || "GENERAL",
      frequency: normalizeFrequency(component.frequency),
      baseAmount,
      annualAmount,
      dueDay: toNumber(component.dueDate, 15),
      applicableFor: normalizeApplicability(component.applicableFor),
      description: component.description || "",
      monthsApplicable: toNumber(component.monthsApplicable, 12),
      quartersApplicable: toNumber(component.quartersApplicable, 4),
      halfYearsApplicable: toNumber(component.halfYearsApplicable, 2),
      isApplicable: isComponentApplicable(component, feeProfileType),
    };
  });

  const structureTotals = structureComponents.reduce(
    (acc, component) => {
      if (!component.isApplicable) return acc;
      acc.total += component.annualAmount;
      const key = component.frequency;
      if (!acc.byFrequency[key]) {
        acc.byFrequency[key] = { total: 0, components: 0 };
      }
      acc.byFrequency[key].total += component.annualAmount;
      acc.byFrequency[key].components += 1;
      return acc;
    },
    { total: 0, byFrequency: {} }
  );

  const componentLedgerMap = new Map();
  const periodLedgerMap = new Map();
  const overdueCollections = [];

  for (const collection of safeCollections) {
    if (collection.paymentStatus === "OVERDUE") {
      overdueCollections.push({
        receiptNumber: collection.receiptNumber,
        dueDate: collection.dueDate,
        pendingAmount: collection.pendingAmount || 0,
        lateFee: collection.lateFee || 0,
      });
    }

    for (const component of collection.feeComponents || []) {
      const componentKey = `${component.componentName}__${component.frequency || "ANNUALLY"}`;
      const paidAmount = toNumber(component.paidAmount);
      const totalAmount = toNumber(component.amount);
      const pendingAmount = Math.max(0, totalAmount - paidAmount);
      const frequency = normalizeFrequency(component.frequency || "ANNUALLY");

      if (!componentLedgerMap.has(componentKey)) {
        componentLedgerMap.set(componentKey, {
          componentName: component.componentName,
          category: component.category || "GENERAL",
          frequency,
          billedAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          collectionCount: 0,
          latestDueDate: component.dueDate || collection.dueDate,
        });
      }

      const ledger = componentLedgerMap.get(componentKey);
      ledger.billedAmount += totalAmount;
      ledger.paidAmount += paidAmount;
      ledger.pendingAmount += pendingAmount;
      ledger.collectionCount += 1;
      if (component.dueDate && (!ledger.latestDueDate || new Date(component.dueDate) > new Date(ledger.latestDueDate))) {
        ledger.latestDueDate = component.dueDate;
      }

      if (!periodLedgerMap.has(frequency)) {
        periodLedgerMap.set(frequency, {
          frequency,
          billedAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          componentCount: 0,
        });
      }

      const periodLedger = periodLedgerMap.get(frequency);
      periodLedger.billedAmount += totalAmount;
      periodLedger.paidAmount += paidAmount;
      periodLedger.pendingAmount += pendingAmount;
      periodLedger.componentCount += 1;
    }
  }

  const componentLedger = Array.from(componentLedgerMap.values()).sort((a, b) =>
    a.componentName.localeCompare(b.componentName)
  );
  const periodLedger = Array.from(periodLedgerMap.values()).sort((a, b) =>
    a.frequency.localeCompare(b.frequency)
  );

  return {
    feeProfileType,
    structureComponents,
    structureTotals,
    componentLedger,
    periodLedger,
    overdueCollections,
  };
}

module.exports = {
  buildFeeCollectionFromStructure,
  buildFeeStructureSummary,
  buildStudentFeeDashboard,
  deriveStudentFeeProfile,
  getAcademicYearStart,
  getAnnualAmountForProfile,
  normalizeApplicability,
  normalizeClassName,
  normalizeFeeComponent,
  normalizeFrequency,
  toNumber,
};
