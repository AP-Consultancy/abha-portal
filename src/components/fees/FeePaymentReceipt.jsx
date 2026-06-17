import {
  ArrowDownTrayIcon,
  PrinterIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CLASS_OPTIONS } from "../../utils/constants";
import { formatCurrency, formatDate, monthLabel, statusBadgeClass } from "../../utils/feeUtils";
import { sectionIdToLabel } from "../../utils/studentUtils";
import {
  downloadReceiptHtml,
  printReceiptElement,
  SCHOOL_RECEIPT_NAME,
} from "../../utils/receiptPrint";

const getClassLabel = (classId) =>
  CLASS_OPTIONS.find((c) => String(c.value) === String(classId))?.label || classId || "—";

const FeePaymentReceipt = ({ receipt, onClose, showActions = true }) => {
  if (!receipt) return null;

  const classLabel = getClassLabel(receipt.student?.classId);
  const sectionLabel = sectionIdToLabel(
    receipt.student?.sectionId,
    receipt.student?.classId
  );
  const studentName =
    receipt.student?.name ||
    [receipt.student?.firstName, receipt.student?.lastName].filter(Boolean).join(" ") ||
    "Student";

  const labels = { classLabel, sectionLabel };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 no-print">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-labelledby="receipt-title"
      >
        {showActions && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 no-print">
            <h2 id="receipt-title" className="text-lg font-semibold text-gray-900">
              Payment receipt
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => printReceiptElement("fee-payment-receipt")}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <PrinterIcon className="w-4 h-4" />
                Print
              </button>
              <button
                type="button"
                onClick={() => downloadReceiptHtml(receipt, labels)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="overflow-y-auto p-6">
          <div
            id="fee-payment-receipt"
            className="fee-receipt-print-area border-2 border-blue-900 rounded-lg p-6 sm:p-8 text-gray-900 bg-white"
          >
            <div className="text-center border-b-2 border-blue-900 pb-4 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 tracking-tight">
                {SCHOOL_RECEIPT_NAME}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Official Fee Payment Receipt</p>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
              <div>
                <dt className="font-semibold text-gray-500">Receipt No.</dt>
                <dd className="font-mono text-gray-900">{receipt.receiptNumber || "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Date</dt>
                <dd>{formatDate(receipt.paymentDate)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Student</dt>
                <dd className="font-medium">{studentName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Scholar No.</dt>
                <dd>{receipt.student?.scholarNumber || "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Class / Section</dt>
                <dd>
                  {classLabel} — Section {sectionLabel || "—"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Academic Year</dt>
                <dd>{receipt.academicYear || "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Payment Mode</dt>
                <dd>{receipt.paymentMode || "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Admission No.</dt>
                <dd>{receipt.student?.admissionNo || "—"}</dd>
              </div>
            </dl>

            {receipt.lineItems?.length > 0 && (
              <div className="mb-6 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 px-3 py-2 text-left">Period</th>
                      <th className="border border-gray-300 px-3 py-2 text-right">Paid</th>
                      <th className="border border-gray-300 px-3 py-2 text-right">Due</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.lineItems.map((row) => (
                      <tr key={row.paymentId || `${row.paymentYear}-${row.paymentMonth}`}>
                        <td className="border border-gray-300 px-3 py-2">
                          {monthLabel(row.paymentMonth)} {row.paymentYear}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-medium">
                          {formatCurrency(row.paidAmount)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {formatCurrency(row.dueAmount)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${statusBadgeClass(
                              row.paymentStatus
                            )}`}
                          >
                            {row.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="space-y-2 text-sm border-t border-dashed border-gray-300 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount paid (this receipt)</span>
                <span className="font-semibold text-green-700">
                  {formatCurrency(receipt.amountPaid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due after this payment (period)</span>
                <span>{formatCurrency(receipt.dueAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly fee</span>
                <span>{formatCurrency(receipt.monthlyFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Yearly fee</span>
                <span>{formatCurrency(receipt.yearlyFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total paid to date</span>
                <span>{formatCurrency(receipt.totalPaidToDate)}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                <span className="font-bold text-blue-900">Balance remaining</span>
                <span className="font-bold text-blue-900">
                  {formatCurrency(receipt.remainingBalance)}
                </span>
              </div>
            </div>

            {receipt.remarks && (
              <p className="mt-4 text-sm text-gray-600">
                <span className="font-semibold">Remarks:</span> {receipt.remarks}
              </p>
            )}

            <p className="mt-6 pt-4 border-t border-gray-200 text-xs text-center text-gray-500">
              Computer-generated receipt. Please retain for your records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeePaymentReceipt;
