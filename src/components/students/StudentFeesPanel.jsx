import React from "react";
import {
  ArrowPathIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  formatCurrency,
  formatDate,
  monthLabel,
  statusBadgeClass,
} from "../../utils/feeUtils";

const OVERALL_STATUS_LABELS = {
  PAID: "Fully Paid",
  PARTIAL: "Partially Paid",
  PENDING: "Payment Pending",
  UNASSIGNED: "Fee Not Assigned",
};

const FeeStatusBadge = ({ status }) => {
  const key = String(status || "PENDING").toUpperCase();
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(key)}`}
    >
      {OVERALL_STATUS_LABELS[key] || key}
    </span>
  );
};

const SummaryCards = ({ summary, feeStatus, paymentPercent }) => (
  <>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <FeeStatusBadge status={feeStatus || summary?.feeStatus} />
      {summary?.academicYear && (
        <span className="text-sm text-gray-500">
          Academic year: <span className="font-medium text-gray-800">{summary.academicYear}</span>
        </span>
      )}
    </div>
    {paymentPercent != null && (
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Payment progress</span>
          <span className="font-medium">{paymentPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${Math.min(100, paymentPercent)}%` }}
          />
        </div>
      </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={CurrencyDollarIcon}
        label="Monthly Fee"
        value={formatCurrency(summary?.monthlyFee)}
        tone="blue"
      />
      <StatCard
        icon={CalendarIcon}
        label="Yearly Fee"
        value={formatCurrency(summary?.yearlyFee || summary?.totalFee)}
        tone="indigo"
      />
      <StatCard
        icon={CheckCircleIcon}
        label="Total Paid"
        value={formatCurrency(summary?.totalPaid)}
        tone="green"
      />
      <StatCard
        icon={ClockIcon}
        label="Remaining"
        value={formatCurrency(summary?.remainingFee ?? summary?.totalPending)}
        tone="amber"
      />
    </div>
  </>
);

const StatCard = ({ icon: Icon, label, value, tone }) => {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className={`rounded-lg p-4 ${tones[tone] || tones.blue}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-8 w-8 shrink-0 opacity-90" />
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const StudentFeesPanel = ({
  feeData,
  loading = false,
  error = null,
  onRefresh,
  variant = "full",
  className = "",
}) => {
  if (loading) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm ${className}`}>
        {error}
      </div>
    );
  }

  if (!feeData) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <BanknotesIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>No fee information available yet.</p>
      </div>
    );
  }

  const { summary = {}, feeStatus, paymentPercent, currentMonthStatus, feeAssignment, payments = [], monthlyLedger = [] } =
    feeData;
  const showFull = variant === "full";

  return (
    <div className={`space-y-6 ${className}`}>
      {onRefresh && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      )}

      <div className={showFull ? "bg-white rounded-lg shadow-md p-6" : ""}>
        {showFull && <h2 className="text-xl font-semibold text-gray-900 mb-4">Fee Summary</h2>}
        <SummaryCards
          summary={summary}
          feeStatus={feeStatus}
          paymentPercent={paymentPercent ?? summary.paymentPercent}
        />
        {(variant === "profile" || showFull) && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <InfoPill label="This month" value={currentMonthStatus || "PENDING"} badge />
            <InfoPill
              label="Last payment"
              value={
                summary.lastPaymentDate
                  ? `${formatDate(summary.lastPaymentDate)} · ${formatCurrency(summary.lastPaymentAmount)}`
                  : "—"
              }
            />
            <InfoPill
              label="Assigned on"
              value={feeAssignment?.assigned_date ? formatDate(feeAssignment.assigned_date) : "—"}
            />
          </div>
        )}
      </div>

      {showFull && monthlyLedger.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Fee Status</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Month</th>
                  <th className="py-2 pr-4">Expected</th>
                  <th className="py-2 pr-4">Paid</th>
                  <th className="py-2 pr-4">Due</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlyLedger.map((row) => (
                  <tr
                    key={row.month}
                    className={`border-b border-gray-100 ${row.isCurrentMonth ? "bg-blue-50/50" : ""}`}
                  >
                    <td className="py-2 pr-4 font-medium">
                      {row.monthLabel}
                      {row.isCurrentMonth && (
                        <span className="ml-2 text-xs text-blue-600">(current)</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">{formatCurrency(row.expectedAmount)}</td>
                    <td className="py-2 pr-4 text-green-700">{formatCurrency(row.paidAmount)}</td>
                    <td className="py-2 pr-4 text-amber-700">{formatCurrency(row.dueAmount)}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass(row.paymentStatus)}`}>
                        {row.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showFull && payments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Period</th>
                  <th className="py-2 pr-4">Paid</th>
                  <th className="py-2 pr-4">Due</th>
                  <th className="py-2 pr-4">Mode</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Receipt</th>
                  <th className="py-2 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((row) => (
                  <tr key={row._id || row.id || `${row.paymentMonth}-${row.paymentYear}`} className="border-b border-gray-100">
                    <td className="py-2 pr-4">
                      {monthLabel(row.paymentMonth)} {row.paymentYear}
                    </td>
                    <td className="py-2 pr-4 text-green-700 font-medium">{formatCurrency(row.paidAmount)}</td>
                    <td className="py-2 pr-4">{formatCurrency(row.dueAmount)}</td>
                    <td className="py-2 pr-4">{row.paymentMode || "—"}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass(row.paymentStatus)}`}>
                        {row.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{row.receiptNumber || "—"}</td>
                    <td className="py-2 pr-4">{formatDate(row.paymentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showFull && payments.length === 0 && feeAssignment && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500 text-sm">
          <XCircleIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          No payments recorded yet for this academic year.
        </div>
      )}
    </div>
  );
};

const InfoPill = ({ label, value, badge }) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
    <p className="text-xs text-gray-500">{label}</p>
    {badge ? (
      <span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass(value)}`}>
        {value}
      </span>
    ) : (
      <p className="font-medium text-gray-900 mt-0.5">{value}</p>
    )}
  </div>
);

export default StudentFeesPanel;
export { FeeStatusBadge, formatCurrency as feeFormatCurrency };
