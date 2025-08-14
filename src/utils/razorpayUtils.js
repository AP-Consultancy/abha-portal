export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = (orderData, onSuccess, onError) => {
  const options = {
    key: "rzp_test_HGSRQVOSEd68Va",
    amount: orderData.amount,
    currency: orderData.currency || "INR",
    name: "School Fee Payment",
    description: "Student Fee Payment",
    order_id: orderData.id,
    handler: onSuccess,
    prefill: {
      name: orderData.notes?.studentName || "",
      email: "",
      contact: "",
    },
    theme: {
      color: "#4f46e5",
    },
    modal: {
      ondismiss: () => onError(new Error("Payment cancelled by user")),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
