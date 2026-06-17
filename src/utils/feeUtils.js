export const PAYMENT_MODES = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PAID", label: "Paid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PENDING", label: "Pending" },
];

export const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
});

export const formatCurrency = (amount) =>
  currencyFormatter.format(Number(amount || 0));

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

export const monthLabel = (month) =>
  MONTH_OPTIONS.find((m) => m.value === Number(month))?.label || month;

export const statusBadgeClass = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "PAID") return "bg-green-100 text-green-800";
  if (s === "PARTIAL") return "bg-amber-100 text-amber-800";
  if (s === "PENDING") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};
