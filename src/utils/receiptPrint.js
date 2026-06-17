import { formatCurrency, formatDate, monthLabel } from "./feeUtils";

export const SCHOOL_RECEIPT_NAME = "Abha Vidya Niketan";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const buildReceiptHtmlDocument = (receipt, { classLabel, sectionLabel } = {}) => {
  const lineRows = (receipt.lineItems || [])
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(monthLabel(row.paymentMonth))} ${escapeHtml(row.paymentYear)}</td>
        <td style="text-align:right">${escapeHtml(formatCurrency(row.paidAmount))}</td>
        <td style="text-align:right">${escapeHtml(formatCurrency(row.dueAmount))}</td>
        <td>${escapeHtml(row.paymentStatus)}</td>
      </tr>`
    )
    .join("");

  const studentName =
    receipt.student?.name ||
    [receipt.student?.firstName, receipt.student?.lastName].filter(Boolean).join(" ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Fee Receipt ${escapeHtml(receipt.receiptNumber)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; margin: 0; padding: 24px; color: #111; }
    .receipt { max-width: 720px; margin: 0 auto; border: 2px solid #1e3a8a; padding: 28px; }
    .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 26px; color: #1e3a8a; }
    .header p { margin: 6px 0 0; color: #444; font-size: 14px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin-bottom: 20px; font-size: 14px; }
    .meta dt { font-weight: bold; color: #374151; }
    .meta dd { margin: 2px 0 0; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0; }
    th, td { border: 1px solid #d1d5db; padding: 8px 10px; }
    th { background: #eff6ff; text-align: left; }
    .totals { margin-top: 20px; font-size: 15px; }
    .totals .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e5e7eb; }
    .totals .row strong { font-size: 17px; color: #1e3a8a; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #d1d5db; font-size: 12px; color: #6b7280; text-align: center; }
    @media print { body { padding: 0; } .receipt { border-width: 1px; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>${escapeHtml(SCHOOL_RECEIPT_NAME)}</h1>
      <p>Official Fee Payment Receipt</p>
    </div>
    <dl class="meta">
      <div><dt>Receipt No.</dt><dd>${escapeHtml(receipt.receiptNumber || "—")}</dd></div>
      <div><dt>Date</dt><dd>${escapeHtml(formatDate(receipt.paymentDate))}</dd></div>
      <div><dt>Student</dt><dd>${escapeHtml(studentName)}</dd></div>
      <div><dt>Scholar No.</dt><dd>${escapeHtml(receipt.student?.scholarNumber || "—")}</dd></div>
      <div><dt>Class / Section</dt><dd>${escapeHtml(classLabel || "—")} — ${escapeHtml(sectionLabel || "—")}</dd></div>
      <div><dt>Academic Year</dt><dd>${escapeHtml(receipt.academicYear || "—")}</dd></div>
      <div><dt>Payment Mode</dt><dd>${escapeHtml(receipt.paymentMode || "—")}</dd></div>
      <div><dt>Admission No.</dt><dd>${escapeHtml(receipt.student?.admissionNo || "—")}</dd></div>
    </dl>
    ${
      lineRows
        ? `<table>
      <thead>
        <tr>
          <th>Period</th>
          <th style="text-align:right">Paid (₹)</th>
          <th style="text-align:right">Due (₹)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${lineRows}</tbody>
    </table>`
        : ""
    }
    <div class="totals">
      <div class="row"><span>Amount paid (this receipt)</span><span>${escapeHtml(formatCurrency(receipt.amountPaid))}</span></div>
      <div class="row"><span>Due after this payment (period)</span><span>${escapeHtml(formatCurrency(receipt.dueAmount))}</span></div>
      <div class="row"><span>Monthly fee</span><span>${escapeHtml(formatCurrency(receipt.monthlyFee))}</span></div>
      <div class="row"><span>Yearly fee</span><span>${escapeHtml(formatCurrency(receipt.yearlyFee))}</span></div>
      <div class="row"><span>Total paid to date</span><span>${escapeHtml(formatCurrency(receipt.totalPaidToDate))}</span></div>
      <div class="row"><strong>Balance remaining</strong><strong>${escapeHtml(formatCurrency(receipt.remainingBalance))}</strong></div>
    </div>
    ${receipt.remarks ? `<p style="font-size:13px;margin-top:12px"><strong>Remarks:</strong> ${escapeHtml(receipt.remarks)}</p>` : ""}
    <div class="footer">
      This is a computer-generated receipt. Please retain for your records.<br />
      Thank you for your payment.
    </div>
  </div>
</body>
</html>`;
};

export const downloadReceiptHtml = (receipt, labels = {}) => {
  const html = buildReceiptHtmlDocument(receipt, labels);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeNo = String(receipt.receiptNumber || "receipt").replace(/[^\w-]+/g, "_");
  link.href = url;
  link.download = `fee-receipt-${safeNo}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printReceiptElement = (elementId = "fee-payment-receipt") => {
  const node = document.getElementById(elementId);
  if (!node) {
    window.print();
    return;
  }

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html><head>
      <title>Fee Receipt</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; }
        @media print { body { padding: 0; } }
      </style>
    </head><body>${node.innerHTML}</body></html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };
};
