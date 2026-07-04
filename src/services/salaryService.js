import apiService from "./apiService";
import { API_ENDPOINTS } from "../utils/constants";
import { teacherService } from "./teacherService";

const toMonthStart = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw.slice(0, 8) + "01";
  return raw;
};

const normalizeStatus = (status) => {
  const key = String(status || "PENDING").trim().toUpperCase();
  const map = {
    PENDING: "Pending",
    PAID: "Paid",
    PARTIAL: "Partial",
    CANCELLED: "Cancelled",
  };
  return map[key] || "Pending";
};

const normalizePaymentMode = (mode) => {
  if (!mode) return "";
  const key = String(mode).trim().toUpperCase();
  const map = {
    BANK_TRANSFER: "Bank Transfer",
    CASH: "Cash",
    CHEQUE: "Cheque",
    UPI: "UPI",
  };
  return map[key] || mode;
};

export const normalizeSalaryRecord = (record = {}) => ({
  ...record,
  _id: record._id || record.salary_record_id || record.id,
  id: record.id || record.salary_record_id,
  teacherId: record.teacherId || record.teacher_id,
  employeeId: record.employeeId || record.employee_id,
  employeeName: record.employeeName || record.employee_name,
  salaryMonth: record.salaryMonth || record.salary_month,
  salaryPeriod: record.salaryPeriod || record.salary_period,
  basicSalary: Number(record.basicSalary ?? record.basic_salary ?? 0),
  allowances: Number(record.allowances ?? 0),
  deductions: Number(record.deductions ?? 0),
  grossSalary: Number(record.grossSalary ?? record.gross_salary ?? 0),
  netSalary: Number(record.netSalary ?? record.net_salary ?? 0),
  paidAmount: Number(record.paidAmount ?? record.paid_amount ?? 0),
  balanceAmount: Number(record.balanceAmount ?? record.balance_amount ?? 0),
  status: normalizeStatus(record.status),
  paymentDate: record.paymentDate || record.payment_date || "",
  paymentMode: normalizePaymentMode(record.payment_mode || record.paymentMode),
  transactionReference:
    record.transactionReference || record.transaction_reference || "",
  remarks: record.remarks || "",
  email: record.email || "",
});

const listFromResponse = (data) => {
  const rows = data.salary || data.data || data || [];
  return Array.isArray(rows) ? rows.map(normalizeSalaryRecord) : [];
};

const teacherKey = (teacher) =>
  String(teacher._id || teacher.id || teacher.teacherId || "");

export const salaryService = {
  getRecords: async ({ salaryRecordId, teacherId, month } = {}) => {
    const endpoint = salaryRecordId
      ? `${API_ENDPOINTS.SALARY}/${salaryRecordId}`
      : API_ENDPOINTS.SALARY;
    const params = new URLSearchParams();
    if (teacherId) params.set("teacher_id", teacherId);
    if (month) params.set("salary_month", toMonthStart(month));
    const query = params.toString() ? `?${params.toString()}` : "";
    const data = await apiService.get(`${endpoint}${query}`);
    const salary = listFromResponse(data);
    return { ...data, salary, data: salary };
  },

  generateMonthly: async ({ month, processedBy }) => {
    return apiService.post(API_ENDPOINTS.SALARY_GENERATE, {
      salary_month: toMonthStart(month),
      processed_by: processedBy || null,
    });
  },

  saveRecord: async (payload) => {
    return apiService.post(API_ENDPOINTS.MANAGE_SALARY, payload);
  },

  updateRecord: async (salaryRecordId, updateData) => {
    return salaryService.saveRecord({
      ...updateData,
      action: 2,
      salary_record_id: salaryRecordId,
    });
  },

  markPaid: async ({ salaryRecordId, processedBy, paymentMode, transactionReference, remarks }) => {
    return salaryService.saveRecord({
      action: 2,
      salary_record_id: salaryRecordId,
      status: "PAID",
      payment_mode: paymentMode || "BANK_TRANSFER",
      transaction_reference: transactionReference || null,
      remarks: remarks || null,
      processed_by: processedBy || null,
    });
  },

  getMonthlyWithRoster: async (month) => {
    const monthKey = toMonthStart(month);
    const rosterResponse = await teacherService.getAllTeachers();
    const roster = rosterResponse.teachers || [];

    const seen = new Set();
    const uniqueRoster = roster.filter((t) => {
      const key = teacherKey(t);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    let records = [];
    try {
      const data = await salaryService.getRecords({ month: monthKey });
      records = data.salary || [];
    } catch (error) {
      console.warn("Could not load salary records:", error);
    }

    const byTeacher = new Map(
      records.map((r) => [String(r.teacherId), r])
    );

    const rows = uniqueRoster.map((teacher) => ({
      teacher,
      salary: byTeacher.get(teacherKey(teacher)) || null,
    }));

    return { rows, records, month: monthKey };
  },

  getEmployeeSalary: async (teacherId) => {
    const data = await salaryService.getRecords({ teacherId });
    const salary = (data.salary || []).sort((a, b) =>
      String(b.salaryMonth).localeCompare(String(a.salaryMonth))
    );
    return { ...data, salary };
  },
};
