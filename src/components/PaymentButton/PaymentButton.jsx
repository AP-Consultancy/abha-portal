import React, { useState } from "react";
import { toast } from "react-toastify";

const PaymentButton = ({ amount }) => {
  const [busy, setBusy] = useState(false);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);

  const handleClick = () => {
    setBusy(true);
    toast.info(
      "Online card payment is not enabled. Please pay at the school office. Admin can record the payment under Fees Management."
    );
    setBusy(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || amount <= 0}
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition duration-300 ${
        busy || amount <= 0
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      Pay at school {formatCurrency(amount)}
    </button>
  );
};

export default PaymentButton;
