import apiService from "./apiService";
import { API_BASE_URL, API_ENDPOINTS } from "../utils/constants";

const normalizeFeeResponse = (data = {}) => {
  const payments = (data.payments || data.feeCollections || []).map((row) => ({
    ...row,
    _id: row._id || row.id,
    paidAmount: Number(row.paidAmount ?? row.paid_amount ?? 0),
    dueAmount: Number(row.dueAmount ?? row.due_amount ?? 0),
    paymentStatus: row.paymentStatus || row.payment_status,
    paymentMode: row.paymentMode || row.payment_mode,
    receiptNumber: row.receiptNumber || row.receipt_no,
    paymentMonth: row.paymentMonth || row.payment_month,
    paymentYear: row.paymentYear || row.payment_year,
  }));

  return {
    ...data,
    student: data.student,
    feeAssignment: data.feeAssignment || null,
    payments,
    feeCollections: payments,
    summary: data.summary || {},
    feeStatus: data.feeStatus || data.summary?.feeStatus || "PENDING",
    paymentPercent: data.paymentPercent ?? data.summary?.paymentPercent ?? 0,
    currentMonthStatus: data.currentMonthStatus || "PENDING",
    latestPayment: data.latestPayment || null,
    currentMonthPayment: data.currentMonthPayment || null,
    monthlyLedger: data.monthlyLedger || [],
  };
};

export const feeService = {
  async getMyFees() {
    try {
      const data = await apiService.get(API_ENDPOINTS.FEES_ME);
      return normalizeFeeResponse(data);
    } catch (error) {
      console.error("Error fetching my fees:", error);
      throw new Error(error.message || "Failed to fetch fee details");
    }
  },

  async searchByScholarNumber(scholarNumber) {
    try {
      const data = await apiService.get(
        `${API_ENDPOINTS.FEES}/search/scholar/${encodeURIComponent(scholarNumber.trim())}`
      );
      return normalizeFeeResponse(data);
    } catch (error) {
      console.error("Error searching student fees:", error);
      throw new Error(error.message || "Failed to search student");
    }
  },

  async getFeeDetails(studentId) {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.FEES}/${studentId}`);
      return normalizeFeeResponse(data);
    } catch (error) {
      console.error("Error fetching fee details:", error);
      throw new Error(error.message || "Failed to fetch fee details");
    }
  },

  async markPaid(payload) {
    try {
      const data = await apiService.post(`${API_ENDPOINTS.FEES}/mark-paid`, {
        studentId: payload.studentId,
        student_id: payload.studentId,
        payment_id: payload.paymentId || null,
        feeCollectionId: payload.paymentId || null,
        amount: payload.amount,
        paid_amount: payload.amount,
        payment_month: payload.paymentMonth,
        payment_year: payload.paymentYear,
        paymentMethod: payload.paymentMethod,
        payment_mode: payload.paymentMethod,
        receiptNumber: payload.receiptNumber,
        remarks: payload.receiptNumber || payload.remarks,
      });
      return {
        ...data,
        receipt: data.receipt || null,
        feeData: data.feeData ? normalizeFeeResponse(data.feeData) : null,
      };
    } catch (error) {
      console.error("Error marking payment:", error);
      throw new Error(error.message || "Failed to record payment");
    }
  },

  async bulkUploadFeeStructure(file) {
    if (!file) {
      throw new Error("Please select a CSV file");
    }

    const formData = new FormData();
    formData.append("csvFile", file);
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.FEES_STRUCTURE_BULK_UPLOAD}`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to upload fee structure");
    }

    return data;
  },

  async listPayments(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, value);
        }
      });
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiService.get(`${API_ENDPOINTS.FEES}/payments${query}`);
      const rows = data.payments || data.data || [];
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      console.error("Error listing payments:", error);
      throw new Error(error.message || "Failed to load payments");
    }
  },
};
