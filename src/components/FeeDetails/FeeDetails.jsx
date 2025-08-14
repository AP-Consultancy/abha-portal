import React, { useEffect, useState } from "react";
import { feeService } from "../../services/feeService";
import { useApp } from "../../contexts/AppContext";
import PaymentButton from "../PaymentButton/PaymentButton";
import LoadingSpinner from "../common/LoadingSpinner";

const FeeDetails = () => {
  const { state, dispatch } = useApp();
  const { selectedStudent, feeData, loading } = state;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (selectedStudent) {
      fetchFeeDetails();
    }
  }, [selectedStudent]);

  const fetchFeeDetails = async () => {
    if (!selectedStudent) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await feeService.getFeeDetails(selectedStudent._id);
      dispatch({ type: "SET_FEE_DATA", payload: response.data });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.response?.data?.message || "Failed to fetch fee details",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeeDetails();
    setRefreshing(false);
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      PAID: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      PARTIAL: "bg-blue-100 text-blue-800",
      OVERDUE: "bg-red-100 text-red-800",
    };
    return `px-3 py-1 rounded-full text-sm font-semibold ${
      classes[status] || classes.PENDING
    }`;
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (!selectedStudent) {
    return (
      <p className="text-center text-gray-600">
        Please select a student to view fee details
      </p>
    );
  }

  if (loading) return <LoadingSpinner message="Loading fee details..." />;

  if (!feeData) {
    return (
      <div className="text-center mt-6">
        <p className="text-red-600 mb-4">
          No fee data available for this student
        </p>
        <button
          onClick={fetchFeeDetails}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  const { student, feeCollections, summary } = feeData;

  return (
    <div className="space-y-6 p-4">
      {/* Student Info */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            👤 Student Information
          </h2>
          <button
            onClick={handleRefresh}
            className="text-sm text-white bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <span className="font-semibold">Name:</span> {student.firstName}{" "}
            {student.lastName}
          </div>
          <div>
            <span className="font-semibold">Student ID:</span>{" "}
            {student.studentId}
          </div>
          <div>
            <span className="font-semibold">Class:</span> {student.className}
          </div>
          <div>
            <span className="font-semibold">Academic Year:</span>{" "}
            {student.academicYear}
          </div>
          {student.email && (
            <div>
              <span className="font-semibold">Email:</span> {student.email}
            </div>
          )}
          {student.phone && (
            <div>
              <span className="font-semibold">Phone:</span> {student.phone}
            </div>
          )}
        </div>
      </div>

      {/* Fee Summary */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">📊 Fee Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">
              {formatCurrency(summary.totalFee)}
            </p>
            <p className="text-gray-600">Total Fee</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(summary.totalPaid)}
            </p>
            <p className="text-gray-600">Paid Amount</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-600">
              {formatCurrency(summary.totalPending)}
            </p>
            <p className="text-gray-600">Pending Amount</p>
          </div>
          {summary.totalLateFee > 0 && (
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(summary.totalLateFee)}
              </p>
              <p className="text-gray-600">Late Fee</p>
            </div>
          )}
        </div>
      </div>

      {/* Fee Collections */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">💰 Fee Collections</h2>
        {feeCollections.length === 0 ? (
          <p className="text-gray-500">
            No fee collections found for this student
          </p>
        ) : (
          <div className="space-y-4">
            {feeCollections.map((collection) => (
              <div
                key={collection._id}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {collection.receiptNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Term: {collection.term} | Due:{" "}
                      {formatDate(collection.dueDate)}
                    </p>
                  </div>
                  <span
                    className={getStatusBadgeClass(collection.paymentStatus)}
                  >
                    {collection.paymentStatus}
                  </span>
                </div>

                <div>
                  <h4 className="font-medium">Fee Components</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {collection.feeComponents.map((component, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{component.componentName}</span>
                        <span>
                          {formatCurrency(component.amount)}
                          {component.isPaid && (
                            <span className="text-green-600 ml-1">✓</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="font-semibold">Total:</span>{" "}
                    {formatCurrency(collection.totalAmount)}
                  </div>
                  <div>
                    <span className="font-semibold">Paid:</span>{" "}
                    <span className="text-green-600">
                      {formatCurrency(collection.paidAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Pending:</span>{" "}
                    <span className="text-yellow-600">
                      {formatCurrency(collection.pendingAmount)}
                    </span>
                  </div>
                  {collection.lateFee > 0 && (
                    <div>
                      <span className="font-semibold">Late Fee:</span>{" "}
                      <span className="text-red-600">
                        {formatCurrency(collection.lateFee)}
                      </span>
                    </div>
                  )}
                </div>

                {collection.pendingAmount > 0 && (
                  <div>
                    <PaymentButton
                      amount={collection.pendingAmount + collection.lateFee}
                      feeCollection={collection}
                      student={student}
                      onPaymentSuccess={fetchFeeDetails}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeDetails;
