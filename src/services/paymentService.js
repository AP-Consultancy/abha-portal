import apiService from "./apiService";
import { API_ENDPOINTS } from "../utils/constants";

const normalizePayment = (row = {}) => ({
  ...row,
  _id: row._id || row.id || row.payment_id,
  id: row.id || row.payment_id,
  studentId: row.studentId || row.student_id,
  studentName: row.studentName || row.student_name,
  scholarNumber: row.scholarNumber || row.scholar_no,
  paymentMonth: row.paymentMonth || row.payment_month,
  paymentYear: row.paymentYear || row.payment_year,
  paidAmount: Number(row.paidAmount ?? row.paid_amount ?? 0),
  dueAmount: Number(row.dueAmount ?? row.due_amount ?? 0),
  paymentStatus: row.paymentStatus || row.payment_status,
  paymentMode: row.paymentMode || row.payment_mode,
  receiptNumber: row.receiptNumber || row.receipt_no,
  paymentDate: row.paymentDate || row.payment_date,
  remarks: row.remarks || "",
});

export const paymentService = {
  getPayments: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : "";
    const data = await apiService.get(`${API_ENDPOINTS.PAYMENTS}${query}`);
    const rows = data.payments || data.data || [];
    return Array.isArray(rows) ? rows.map(normalizePayment) : [];
  },

  managePayment: async (payload) => {
    const body = {
      action: payload.action ?? 1,
      payment_id: payload.paymentId || payload.payment_id || null,
      student_id: payload.studentId || payload.student_id,
      payment_month: payload.paymentMonth || payload.payment_month,
      payment_year: payload.paymentYear || payload.payment_year,
      paid_amount: payload.paidAmount ?? payload.paid_amount ?? payload.amount,
      payment_mode: (payload.paymentMode || payload.payment_mode || "CASH").toUpperCase(),
      remarks: payload.remarks || payload.receiptNumber || null,
    };
    return apiService.post(API_ENDPOINTS.MANAGE_PAYMENT, body);
  },
};
