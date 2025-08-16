import React, { useState } from "react";
import { paymentService } from "../../services/paymentService";
import {
  loadRazorpayScript,
  createRazorpayOrder,
} from "../../utils/razorpayUtils";
import { toast } from "react-toastify";

const PaymentButton = ({
  amount,
  feeCollection,
  student,
  onPaymentSuccess,
}) => {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setProcessing(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error(
          "Razorpay SDK failed to load. Please check your internet connection."
        );
      }

      const orderData = {
        amount,
        studentId: student._id,
        feeCollectionId: feeCollection._id,
        receipt: `fee_${feeCollection.receiptNumber}_${Date.now()}`,
      };

      const orderResponse = await paymentService.createOrder(orderData);
      const order = orderResponse; // apiService returns parsed JSON directly

      const onSuccess = async (response) => {
        try {
          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            studentId: student._id,
            feeCollectionId: feeCollection._id,
            amount: amount,
          };

          await paymentService.verifyPayment(verificationData);

          toast.success(`Payment of ${formatCurrency(amount)} successful!`);
          onPaymentSuccess?.();
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error("Payment verification failed. Please contact support.");
        } finally {
          setProcessing(false);
        }
      };

      const onError = (error) => {
        console.error("Payment error:", error);
        toast.error(error.message || "Payment failed. Please try again.");
        setProcessing(false);
      };

      const studentName = `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim();
      createRazorpayOrder(
        {
          ...order,
          // Prefer gateway order.amount (paise) if present; handler doesn't rely on amount when order_id is set
          amount: order?.amount ?? Math.round(amount * 100),
          notes: {
            ...(order?.notes || {}),
            studentName,
          },
        },
        onSuccess,
        onError
      );
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(
        error.response?.data?.message || "Failed to initiate payment"
      );
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <button
      onClick={handlePayment}
      disabled={processing || amount <= 0}
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold text-white shadow-md transition duration-300 ${
        processing
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {processing ? (
        <>
          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          Processing...
        </>
      ) : (
        <>
          <span className="text-lg">💳</span>
          Pay {formatCurrency(amount)}
        </>
      )}
    </button>
  );
};

export default PaymentButton;
