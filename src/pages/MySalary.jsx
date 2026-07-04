import React, { useState, useEffect } from "react";
import { CalendarIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { salaryService } from "../services/salaryService";
import { teacherService } from "../services/teacherService";
import { useAuth } from "../contexts/AuthContext";
import { formatSalary } from "../utils/teacherUtils";

const statusColor = (status) => {
  switch (status) {
    case "Paid":
      return "bg-green-50 border-green-200 text-green-800";
    case "Partial":
      return "bg-amber-50 border-amber-200 text-amber-800";
    case "Cancelled":
      return "bg-gray-50 border-gray-200 text-gray-700";
    default:
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
  }
};

const MySalary = () => {
  const { user } = useAuth();
  const [salary, setSalary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [teacherId, setTeacherId] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setMessage("");
        const profile = await teacherService.getTeacherProfile(user);
        const teacherId =
          profile?.teacherId || profile?.id || profile?._id ||
          user?.userData?.teacherId;

        if (!teacherId) {
          setMessage("Could not find your employee profile.");
          return;
        }

        setEmployeeName(
          profile?.name ||
            [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
            "Employee"
        );
        setTeacherId(String(teacherId));

        const data = await salaryService.getEmployeeSalary(teacherId);
        setSalary(data.salary || []);
      } catch (error) {
        console.error("Error fetching salary:", error);
        setMessage("Error loading salary records");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const totalPaid = salary
    .filter((r) => r.status === "Paid")
    .reduce((sum, r) => sum + (r.netSalary || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Salary</h1>
          <p className="text-sm text-gray-600 mt-1">
            {employeeName}
            {teacherId && (
              <span className="ml-2 text-gray-500 font-mono">Teacher ID: {teacherId}</span>
            )}
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 border rounded-lg px-3 py-2">
          Total received: {formatSalary(totalPaid)}
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-600">Loading salary records...</div>
      ) : salary.length === 0 && !message ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No salary records found yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allowances</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salary.map((record) => (
                  <tr key={record._id || record.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        {record.salaryPeriod ||
                          new Date(record.salaryMonth).toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                          })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatSalary(record.basicSalary)}</td>
                    <td className="px-6 py-4 text-sm">{formatSalary(record.allowances)}</td>
                    <td className="px-6 py-4 text-sm">{formatSalary(record.deductions)}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatSalary(record.netSalary)}</td>
                    <td className="px-6 py-4 text-sm">{formatSalary(record.paidAmount)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${statusColor(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.paymentDate
                        ? new Date(record.paymentDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySalary;
