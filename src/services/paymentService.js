import apiService from "./apiService";
import { API_ENDPOINTS } from "../utils/constants";

export const paymentService = {
  async createOrder(orderData) {
    try {
      return await apiService.post(`${API_ENDPOINTS.PAYMENTS}/create-order`, orderData);
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order. Please try again.");
    }
  },

  async verifyPayment(paymentData) {
    try {
      return await apiService.post(`${API_ENDPOINTS.PAYMENTS}/verify`, paymentData);
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw new Error("Failed to verify payment. Please try again.");
    }
  },

  async getTransactionHistory(studentId) {
    try {
      return await apiService.get(`${API_ENDPOINTS.PAYMENTS}/transactions/${studentId}`);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw new Error("Failed to fetch transaction history. Please try again.");
    }
  },

  async processRefund(refundData) {
    try {
      return await apiService.post(`${API_ENDPOINTS.PAYMENTS}/refund`, refundData);
    } catch (error) {
      console.error("Error processing refund:", error);
      throw new Error("Failed to process refund. Please try again.");
    }
  },
};
