import React, { useEffect, useState } from "react";
import { paymentService } from "../../services/paymentService";
import { useApp } from "../../contexts/AppContext";
import LoadingSpinner from "../common/LoadingSpinner";

const PaymentHistory = () => {
  const { state } = useApp();
  const { selectedStudent } = state;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (selectedStudent) {
      fetchTransactions();
    }
  }, [selectedStudent, filters]);

  const fetchTransactions = async (page = 1) => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const response = await paymentService.getTransactionHistory(
        selectedStudent._id,
        { page, limit: 10, ...filters }
      );
      setTransactions(response.data.transactions);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      SUCCESS: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      FAILED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-300 text-gray-800",
      REFUNDED: "bg-blue-100 text-blue-800",
    };
    return `px-3 py-1 rounded-full text-sm font-medium ${
      statusClasses[status] || statusClasses.PENDING
    }`;
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const downloadReceipt = (receiptUrl) => {
    if (receiptUrl) window.open(receiptUrl, "_blank");
  };

  if (!selectedStudent) {
    return (
      <p className="text-center text-gray-600">
        Please select a student to view payment history
      </p>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          📋 Payment History
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />

          <button
            onClick={() =>
              setFilters({ status: "", startDate: "", endDate: "" })
            }
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Clear Filters
          </button>
        </div>

        {loading && <LoadingSpinner message="Loading transactions..." />}

        {!loading && transactions.length === 0 && (
          <p className="text-center text-red-500">
            No payment transactions found
          </p>
        )}

        {!loading && transactions.length > 0 && (
          <div className="space-y-6">
            {transactions.map((txn) => (
              <div key={txn._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="text-lg font-semibold">
                      {formatCurrency(txn.amount)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ID: {txn.transactionId} • {formatDate(txn.paymentDate)}
                    </p>
                  </div>
                  <span className={getStatusBadgeClass(txn.paymentStatus)}>
                    {txn.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <p>
                    <strong>Payment Method:</strong> {txn.paymentMethod}
                  </p>
                  <p>
                    <strong>Gateway:</strong> {txn.paymentGateway}
                  </p>
                  {txn.feeCollectionId && (
                    <p>
                      <strong>Receipt No:</strong>{" "}
                      {txn.feeCollectionId.receiptNumber}
                    </p>
                  )}
                  {txn.gatewayTransactionId && (
                    <p>
                      <strong>Gateway TXN ID:</strong>{" "}
                      <span className="text-xs break-all">
                        {txn.gatewayTransactionId}
                      </span>
                    </p>
                  )}
                </div>

                {txn.receiptUrl && (
                  <div className="mt-3">
                    <button
                      onClick={() => downloadReceipt(txn.receiptUrl)}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      📄 Download Receipt
                    </button>
                  </div>
                )}

                {txn.refundDetails && (
                  <div className="mt-4 bg-gray-100 p-4 rounded">
                    <h5 className="font-semibold mb-2">Refund Information:</h5>
                    <p>
                      <strong>Refund Amount:</strong>{" "}
                      {formatCurrency(txn.refundDetails.refundAmount)}
                    </p>
                    <p>
                      <strong>Refund Date:</strong>{" "}
                      {formatDate(txn.refundDetails.refundDate)}
                    </p>
                    <p>
                      <strong>Reason:</strong> {txn.refundDetails.refundReason}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => fetchTransactions(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages} (
                  {pagination.total} total)
                </span>

                <button
                  onClick={() => fetchTransactions(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
