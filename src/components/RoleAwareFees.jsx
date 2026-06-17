import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import Fees from "../pages/Fees";
import { feeService } from "../services/feeService";
import StudentFeesPanel from "./students/StudentFeesPanel";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

const RoleAwareFees = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await feeService.getMyFees();
      setFeeData(response);
    } catch (err) {
      console.error("Error fetching fee details:", err);
      setError(err.message || "Failed to load fee information");
      setFeeData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userRole === "student") {
      loadFees();
    } else {
      setLoading(false);
    }
  }, [userRole, loadFees]);

  if (userRole === "admin") {
    return <Fees />;
  }

  if (userRole === "teacher" || userRole === "employee") {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fees</h1>
        <p className="text-gray-600 mb-4">
          Fee collection and payment recording are managed by the school office (admin).
          Use the admin portal or contact the office to record student payments.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          Teachers can view student fee status from the student list when that feature is enabled.
        </div>
      </div>
    );
  }

  if (userRole === "student") {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Fees</h1>
          <p className="text-gray-600">
            Live fee status and payment history — updated when the school records a payment.
          </p>
        </div>

        {!loading && !error && !feeData?.feeAssignment && !feeData?.summary?.yearlyFee ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-center py-8">
              <CurrencyDollarIcon className="w-14 h-14 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No fee assignment</h3>
              <p className="text-gray-500 text-sm">
                Fee structure has not been assigned to your account yet. Contact the office if this seems wrong.
              </p>
            </div>
          </div>
        ) : null}

        <StudentFeesPanel
          feeData={feeData}
          loading={loading}
          error={error}
          onRefresh={loadFees}
          variant="full"
        />
      </div>
    );
  }

  return null;
};

export default RoleAwareFees;
