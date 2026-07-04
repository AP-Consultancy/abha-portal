import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarIcon,
  CheckIcon,
  CurrencyDollarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { salaryService } from "../services/salaryService";
import { useAuth } from "../contexts/AuthContext";
import { formatSalary } from "../utils/teacherUtils";

const PAYMENT_MODES = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "UPI", label: "UPI" },
];

const getDefaultMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const calcNet = (basic, allowances, deductions) =>
  Math.max(Number(basic || 0) + Number(allowances || 0) - Number(deductions || 0), 0);

const SalaryManagement = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonth());
  const [rows, setRows] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const processedBy = user?.userData?.id || user?.userData?._id || user?.id || null;

  const loadData = useCallback(async () => {
    if (!selectedMonth) return;
    try {
      setLoading(true);
      setMessage("");
      const data = await salaryService.getMonthlyWithRoster(selectedMonth);
      setRows(data.rows || []);

      const nextDrafts = {};
      data.rows?.forEach(({ teacher, salary }) => {
        const tid = teacher._id || teacher.id || teacher.teacherId;
        const basic = salary?.basicSalary ?? teacher.salary ?? 0;
        const allowances = salary?.allowances ?? 0;
        const deductions = salary?.deductions ?? 0;
        nextDrafts[tid] = {
          salaryRecordId: salary?.id || salary?._id || null,
          basicSalary: basic,
          allowances,
          deductions,
          netSalary: salary?.netSalary ?? calcNet(basic, allowances, deductions),
          status: salary?.status || "Pending",
          paymentMode: salary?.paymentMode || "Bank Transfer",
          remarks: salary?.remarks || "",
        };
      });
      setDrafts(nextDrafts);
    } catch (error) {
      console.error("Error loading salary data:", error);
      setMessage(error.message || "Error loading salary data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateDraft = (teacherId, field, value) => {
    setDrafts((prev) => {
      const current = prev[teacherId] || {};
      const next = { ...current, [field]: value };
      if (["basicSalary", "allowances", "deductions"].includes(field)) {
        next.netSalary = calcNet(next.basicSalary, next.allowances, next.deductions);
      }
      return { ...prev, [teacherId]: next };
    });
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setMessage("");
      const result = await salaryService.generateMonthly({
        month: selectedMonth,
        processedBy,
      });
      setMessage(result.message || "Salary generated successfully");
      await loadData();
    } catch (error) {
      setMessage(error.message || "Failed to generate salary");
    } finally {
      setGenerating(false);
    }
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      setMessage("");

      for (const item of rows) {
        const tid = item.teacher._id || item.teacher.id || item.teacher.teacherId;
        const draft = drafts[tid];
        if (!draft) continue;

        const gross =
          Number(draft.basicSalary || 0) + Number(draft.allowances || 0);
        const net = calcNet(draft.basicSalary, draft.allowances, draft.deductions);
        const payload = {
          teacher_id: tid,
          salary_month: `${selectedMonth}-01`,
          basic_salary: draft.basicSalary,
          allowances: draft.allowances,
          deductions: draft.deductions,
          gross_salary: gross,
          net_salary: net,
          paid_amount: draft.status === "Paid" ? net : 0,
          status: String(draft.status || "Pending").toUpperCase(),
          payment_mode:
            draft.status === "Paid"
              ? PAYMENT_MODES.find((m) => m.label === draft.paymentMode)?.value ||
                "BANK_TRANSFER"
              : null,
          remarks: draft.remarks || null,
          processed_by: processedBy,
        };

        if (draft.salaryRecordId) {
          await salaryService.updateRecord(draft.salaryRecordId, payload);
        } else {
          await salaryService.saveRecord({ action: 1, ...payload });
        }
      }

      setMessage("Salary saved successfully!");
      await loadData();
    } catch (error) {
      setMessage(error.message || "Error saving salary records");
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (teacherId) => {
    const draft = drafts[teacherId];
    if (!draft?.salaryRecordId) {
      setMessage("Generate or save salary for this month before marking paid.");
      return;
    }
    try {
      await salaryService.markPaid({
        salaryRecordId: draft.salaryRecordId,
        processedBy,
        paymentMode:
          PAYMENT_MODES.find((m) => m.label === draft.paymentMode)?.value ||
          "BANK_TRANSFER",
        remarks: draft.remarks,
      });
      setMessage("Marked as paid.");
      await loadData();
    } catch (error) {
      setMessage(error.message || "Could not mark as paid");
    }
  };

  const summary = rows.reduce(
    (acc, item) => {
      const tid = item.teacher._id || item.teacher.id || item.teacher.teacherId;
      const draft = drafts[tid];
      const status = draft?.status || "Pending";
      acc.totalNet += draft?.netSalary || 0;
      if (status === "Paid") acc.paid += 1;
      else if (status === "Pending") acc.pending += 1;
      else acc.other += 1;
      return acc;
    },
    { totalNet: 0, paid: 0, pending: 0, other: 0 }
  );

  const monthLabel = new Date(`${selectedMonth}-01`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Generate and manage monthly employee salaries. Admin only.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary month *
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            <SparklesIcon className="h-4 w-4" />
            {generating ? "Generating..." : "Generate Salary"}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Generate creates salary records from each employee&apos;s base salary in the Employees
          page. Existing records for {monthLabel} are skipped.
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            /error|fail/i.test(message)
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
              {monthLabel}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Employees: {rows.length} · Pending: {summary.pending} · Paid: {summary.paid} ·
              Total net: {formatSalary(summary.totalNet)}
            </p>
          </div>
          <button
            type="button"
            onClick={saveAll}
            disabled={saving || rows.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckIcon className="h-4 w-4" />
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-600">Loading salary data...</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No employees found. Add staff from the Employees page, then click Generate Salary.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allowances</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((item, index) => {
                  const tid = item.teacher._id || item.teacher.id || item.teacher.teacherId;
                  const name =
                    item.teacher.name ||
                    `${item.teacher.firstName || ""} ${item.teacher.lastName || ""}`.trim();
                  const draft = drafts[tid] || {};
                  const hasRecord = Boolean(draft.salaryRecordId);

                  return (
                    <tr key={tid} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {name}
                        {hasRecord && (
                          <span className="ml-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                            Saved
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.teacher.enrollmentNo || item.teacher.employee_id || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                        {tid || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={draft.basicSalary ?? ""}
                          onChange={(e) => updateDraft(tid, "basicSalary", e.target.value)}
                          className="w-24 border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={draft.allowances ?? ""}
                          onChange={(e) => updateDraft(tid, "allowances", e.target.value)}
                          className="w-24 border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={draft.deductions ?? ""}
                          onChange={(e) => updateDraft(tid, "deductions", e.target.value)}
                          className="w-24 border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatSalary(draft.netSalary || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={draft.status || "Pending"}
                          onChange={(e) => updateDraft(tid, "status", e.target.value)}
                          className="border rounded-lg px-2 py-1 text-sm"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Partial">Partial</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {hasRecord && draft.status !== "Paid" && (
                          <button
                            type="button"
                            onClick={() => markPaid(tid)}
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryManagement;
