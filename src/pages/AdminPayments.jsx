import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MagnifyingGlassIcon,
  BanknotesIcon,
  CheckIcon,
  ClockIcon,
  UserIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { feeService } from "../services/feeService";
import { paymentService } from "../services/paymentService";
import { studentService } from "../services/studentService";
import {
  ACADEMIC_YEAR_OPTIONS,
  CLASS_OPTIONS,
  SECTION_OPTIONS,
} from "../utils/constants";
import { resolveSectionIdForClass, sectionIdToLabel } from "../utils/studentUtils";
import FeePaymentReceipt from "../components/fees/FeePaymentReceipt";
import {
  formatCurrency,
  formatDate,
  monthLabel,
  PAYMENT_MODES,
  PAYMENT_STATUS_OPTIONS,
  MONTH_OPTIONS,
  statusBadgeClass,
} from "../utils/feeUtils";

const currentDate = new Date();

const AdminPayments = () => {
  const [activeTab, setActiveTab] = useState("record");

  const [scholarSearch, setScholarSearch] = useState("");
  const [studentFee, setStudentFee] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudentKey, setSelectedStudentKey] = useState(null);

  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterStudents, setRosterStudents] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterTotal, setRosterTotal] = useState(0);
  const rosterRequestRef = useRef(0);

  const [paymentForm, setPaymentForm] = useState({
    paymentMonth: currentDate.getMonth() + 1,
    paymentYear: currentDate.getFullYear(),
    amount: "",
    paymentMode: "CASH",
    receiptNumber: "",
    remarks: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [lastReceipt, setLastReceipt] = useState(null);

  const [allPayments, setAllPayments] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilters, setHistoryFilters] = useState({
    scholar_no: "",
    payment_status: "",
    payment_month: "",
    payment_year: String(currentDate.getFullYear()),
  });

  const getClassLabel = (classId) =>
    CLASS_OPTIONS.find((c) => String(c.value) === String(classId))?.label || classId || "—";

  const getSectionLabel = (sectionId, classId) =>
    sectionIdToLabel(sectionId, classId) || sectionId || "—";

  const clearSelectedStudent = useCallback(() => {
    setStudentFee(null);
    setSelectedStudentKey(null);
    setScholarSearch("");
  }, []);

  const loadRoster = useCallback(async () => {
    if (!filterClass || !filterSection) {
      setRosterStudents([]);
      setRosterTotal(0);
      return;
    }

    const expectedSectionId = resolveSectionIdForClass(filterClass, filterSection);
    if (expectedSectionId === null) {
      setRosterStudents([]);
      setRosterTotal(0);
      setMessage("Invalid class or section selection.");
      return;
    }

    const requestId = rosterRequestRef.current + 1;
    rosterRequestRef.current = requestId;

    try {
      setRosterLoading(true);
      setMessage("");
      const result = await studentService.getAllStudents({
        classId: filterClass,
        section: filterSection,
        academicYearId: ACADEMIC_YEAR_OPTIONS[0]?.value || "1",
        limit: 100,
        page: 1,
      });

      if (requestId !== rosterRequestRef.current) return;

      const students = (result.students || []).filter((student) => {
        const classId = Number(student.classId || student.class_id);
        const sectionId = Number(student.sectionId || student.section_id);
        return (
          classId === Number(filterClass) &&
          sectionId === Number(expectedSectionId)
        );
      });

      setRosterStudents(students);
      setRosterTotal(students.length);
    } catch (error) {
      if (requestId !== rosterRequestRef.current) return;
      setRosterStudents([]);
      setRosterTotal(0);
      setMessage(error.message || "Failed to load students for this class.");
    } finally {
      if (requestId === rosterRequestRef.current) {
        setRosterLoading(false);
      }
    }
  }, [filterClass, filterSection]);

  useEffect(() => {
    if (activeTab === "record" && filterClass && filterSection) {
      loadRoster();
    }
  }, [activeTab, filterClass, filterSection, loadRoster]);

  const filteredRoster = useMemo(() => {
    const term = rosterSearch.trim().toLowerCase();
    if (!term) return rosterStudents;
    return rosterStudents.filter((s) => {
      const name = [s.firstName, s.middleName, s.lastName, s.student_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const scholar = String(s.scholarNumber || s.enrollmentNo || "").toLowerCase();
      const roll = String(s.rollNo || "").toLowerCase();
      return name.includes(term) || scholar.includes(term) || roll.includes(term);
    });
  }, [rosterStudents, rosterSearch]);

  const loadStudent = async (scholarNo, studentRow = null) => {
    const term = (scholarNo || scholarSearch).trim();
    if (!term) {
      setMessage("Enter a scholar or admission number.");
      return;
    }

    try {
      setSearchLoading(true);
      setMessage("");
      const data = await feeService.searchByScholarNumber(term);
      setStudentFee(data);
      if (studentRow) {
        setSelectedStudentKey(
          studentRow.id || studentRow.studentId || studentRow.scholarNumber
        );
      }
      setScholarSearch(term);

      const monthly = data.summary?.monthlyFee || 0;
      setPaymentForm((prev) => ({
        ...prev,
        amount: monthly ? String(monthly) : prev.amount,
      }));
    } catch (error) {
      setStudentFee(null);
      setSelectedStudentKey(null);
      setMessage(error.message || "Student not found");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectRosterStudent = (student) => {
    const scholar = student.scholarNumber || student.enrollmentNo;
    if (!scholar) {
      setMessage("This student has no scholar number on record.");
      return;
    }
    loadStudent(scholar, student);
  };

  const loadPaymentHistory = async () => {
    try {
      setHistoryLoading(true);
      const rows = await paymentService.getPayments({
        scholar_no: historyFilters.scholar_no || undefined,
        payment_status: historyFilters.payment_status || undefined,
        payment_month: historyFilters.payment_month || undefined,
        payment_year: historyFilters.payment_year || undefined,
      });
      setAllPayments(rows);
    } catch (error) {
      setMessage(error.message || "Failed to load payment history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadPaymentHistory();
    }
  }, [activeTab]);

  const handleRecordPayment = async () => {
    if (!studentFee?.student?.id) {
      setMessage("Search and select a student first.");
      return;
    }

    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setMessage("Enter a valid payment amount.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payResult = await feeService.markPaid({
        studentId: studentFee.student.id,
        amount: Number(paymentForm.amount),
        paymentMonth: Number(paymentForm.paymentMonth),
        paymentYear: Number(paymentForm.paymentYear),
        paymentMethod: paymentForm.paymentMode,
        receiptNumber: paymentForm.receiptNumber,
        remarks: paymentForm.remarks || paymentForm.receiptNumber,
      });

      const refreshed = payResult.feeData
        ? payResult.feeData
        : await feeService.searchByScholarNumber(studentFee.student.scholarNumber);
      setStudentFee(refreshed);

      if (payResult.receipt) {
        setLastReceipt(payResult.receipt);
      } else {
        setLastReceipt({
          receiptNumber: paymentForm.receiptNumber || `TXN-${Date.now()}`,
          paymentDate: new Date().toISOString(),
          paymentMode: paymentForm.paymentMode,
          remarks: paymentForm.remarks || null,
          amountPaid: Number(paymentForm.amount),
          dueAmount: refreshed.summary?.remainingFee ?? 0,
          monthlyFee: refreshed.summary?.monthlyFee ?? 0,
          yearlyFee: refreshed.summary?.yearlyFee ?? 0,
          totalPaidToDate: refreshed.summary?.totalPaid ?? 0,
          remainingBalance: refreshed.summary?.remainingFee ?? 0,
          academicYear: refreshed.feeAssignment?.academic_year_name || null,
          student: {
            name: `${studentFee.student.firstName || ""} ${studentFee.student.lastName || ""}`.trim(),
            scholarNumber: studentFee.student.scholarNumber,
            admissionNo: studentFee.student.enrollmentNo,
            classId: studentFee.student.classId,
            sectionId: studentFee.student.sectionId,
          },
          lineItems: [
            {
              paymentMonth: Number(paymentForm.paymentMonth),
              paymentYear: Number(paymentForm.paymentYear),
              paidAmount: Number(paymentForm.amount),
              dueAmount: 0,
              paymentStatus: "PAID",
            },
          ],
        });
      }
      const monthly = refreshed.summary?.monthlyFee || 0;
      const remaining = refreshed.summary?.remainingFee || 0;
      setPaymentForm((prev) => ({
        ...prev,
        amount: remaining > 0 ? String(remaining) : monthly ? String(monthly) : "",
        receiptNumber: "",
        remarks: "",
      }));
      setMessage("Payment recorded successfully.");
    } catch (error) {
      setMessage(error.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {lastReceipt && (
        <FeePaymentReceipt
          receipt={lastReceipt}
          onClose={() => setLastReceipt(null)}
        />
      )}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Payment Management</h1>
        <p className="text-gray-600 mt-2">
          Filter students by class and section, click a name to open their fee account, then record
          cash, UPI, or cheque payments.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Logged in as admin · payments linked to student, month, year, and amount.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border text-sm ${
            message.toLowerCase().includes("success")
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-6 flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("record")}
            className={`py-4 border-b-2 font-medium text-sm ${
              activeTab === "record"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Record Payment
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`py-4 border-b-2 font-medium text-sm ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Payment History
          </button>
        </div>

        <div className="p-6">
          {activeTab === "record" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-4 space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FunnelIcon className="h-5 w-5 text-indigo-600" />
                      <h2 className="text-lg font-semibold text-indigo-900">
                        Class &amp; section
                      </h2>
                    </div>
                    <p className="text-sm text-indigo-800/80 mb-4">
                      Pick a class and section, then click a student to manage their fees.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Class *
                        </label>
                        <select
                          value={filterClass}
                          onChange={(e) => {
                            setFilterClass(e.target.value);
                            setFilterSection("");
                            setRosterStudents([]);
                            setRosterTotal(0);
                            rosterRequestRef.current += 1;
                            clearSelectedStudent();
                          }}
                          className="w-full border border-indigo-200 rounded-lg px-3 py-2.5 bg-white"
                        >
                          <option value="">Select class</option>
                          {CLASS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section *
                        </label>
                        <select
                          value={filterSection}
                          onChange={(e) => {
                            setFilterSection(e.target.value);
                            setRosterStudents([]);
                            setRosterTotal(0);
                            rosterRequestRef.current += 1;
                            clearSelectedStudent();
                          }}
                          disabled={!filterClass}
                          className="w-full border border-indigo-200 rounded-lg px-3 py-2.5 bg-white disabled:bg-gray-100"
                        >
                          <option value="">
                            {filterClass ? "Select section" : "Select class first"}
                          </option>
                          {SECTION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              Section {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {filterClass && filterSection && (
                      <p className="text-xs text-gray-600 mt-3">
                        {rosterLoading
                          ? "Loading students…"
                          : `${rosterTotal} student${rosterTotal === 1 ? "" : "s"} in ${getClassLabel(filterClass)} — Section ${filterSection}`}
                      </p>
                    )}
                  </div>

                  {filterClass && filterSection && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col max-h-[min(520px,60vh)]">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                          Search in list
                        </label>
                        <input
                          type="text"
                          value={rosterSearch}
                          onChange={(e) => setRosterSearch(e.target.value)}
                          placeholder="Name, scholar no., roll no."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div
                        key={`${filterClass}-${filterSection}`}
                        className="overflow-y-auto flex-1 divide-y divide-gray-100"
                      >
                        {rosterLoading ? (
                          <p className="text-sm text-gray-500 text-center py-8">Loading…</p>
                        ) : filteredRoster.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-8 px-4">
                            {rosterStudents.length === 0
                              ? "No students in this class and section."
                              : "No students match your search."}
                          </p>
                        ) : (
                          filteredRoster.map((student) => {
                            const key =
                              student.id ||
                              student.studentId ||
                              student.scholarNumber;
                            const isSelected = selectedStudentKey === key;
                            const displayName =
                              [student.firstName, student.middleName, student.lastName]
                                .filter(Boolean)
                                .join(" ") ||
                              student.student_name ||
                              "Student";
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => handleSelectRosterStudent(student)}
                                className={`w-full text-left px-4 py-3 transition-colors hover:bg-blue-50 ${
                                  isSelected
                                    ? "bg-blue-100 border-l-4 border-blue-600"
                                    : ""
                                }`}
                              >
                                <p className="font-medium text-gray-900 text-sm">
                                  {displayName}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  Scholar: {student.scholarNumber || student.enrollmentNo || "—"}
                                  {student.rollNo ? ` · Roll ${student.rollNo}` : ""}
                                </p>
                              </button>
                            );
                          })
                        )}
                      </div>
                      {rosterTotal > 100 && (
                        <p className="text-xs text-amber-800 bg-amber-50 border-t border-amber-100 px-4 py-2">
                          Showing first 100 students. Use scholar search for others.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="xl:col-span-8 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-blue-900">
                    Or search by scholar number
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={scholarSearch}
                    onChange={(e) => setScholarSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadStudent()}
                    placeholder="Scholar no. or admission no."
                    className="flex-1 border border-blue-300 rounded-lg px-4 py-3"
                  />
                  <button
                    type="button"
                    onClick={() => loadStudent()}
                    disabled={searchLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {searchLoading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              {studentFee?.student && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 lg:col-span-1">
                      <div className="flex items-center gap-2 mb-3">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">Student</h3>
                      </div>
                      <p className="font-medium text-lg">
                        {studentFee.student.firstName} {studentFee.student.lastName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Scholar: {studentFee.student.scholarNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        Class: {getClassLabel(studentFee.student.classId)} — Section{" "}
                        {getSectionLabel(
                          studentFee.student.sectionId,
                          studentFee.student.classId
                        )}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 lg:col-span-2">
                      <h3 className="font-semibold text-gray-900 mb-3">Fee summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Monthly fee</p>
                          <p className="text-xl font-bold text-indigo-700">
                            {formatCurrency(studentFee.summary?.monthlyFee)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Yearly fee</p>
                          <p className="text-xl font-bold text-indigo-700">
                            {formatCurrency(studentFee.summary?.yearlyFee)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total paid</p>
                          <p className="text-xl font-bold text-green-700">
                            {formatCurrency(studentFee.summary?.totalPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Remaining</p>
                          <p className="text-xl font-bold text-red-700">
                            {formatCurrency(studentFee.summary?.remainingFee)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Academic year:{" "}
                        {ACADEMIC_YEAR_OPTIONS.find(
                          (y) =>
                            String(y.value) ===
                            String(studentFee.feeAssignment?.academic_year_id || "1")
                        )?.label || "2026-27"}
                      </p>
                    </div>
                  </div>

                  {studentFee.payments?.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 font-medium text-gray-900">
                        Previous payments
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-left text-gray-500">
                            <tr>
                              <th className="px-4 py-2">Period</th>
                              <th className="px-4 py-2">Paid</th>
                              <th className="px-4 py-2">Mode</th>
                              <th className="px-4 py-2">Status</th>
                              <th className="px-4 py-2">Receipt</th>
                              <th className="px-4 py-2">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {studentFee.payments.map((p) => (
                              <tr key={p._id}>
                                <td className="px-4 py-2">
                                  {monthLabel(p.paymentMonth)} {p.paymentYear}
                                </td>
                                <td className="px-4 py-2 font-medium">
                                  {formatCurrency(p.paidAmount)}
                                </td>
                                <td className="px-4 py-2">{p.paymentMode}</td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs ${statusBadgeClass(
                                      p.paymentStatus
                                    )}`}
                                  >
                                    {p.paymentStatus}
                                  </span>
                                </td>
                                <td className="px-4 py-2">{p.receiptNumber || "—"}</td>
                                <td className="px-4 py-2">{formatDate(p.paymentDate)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <BanknotesIcon className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Record new payment</h3>
                      </div>
                      {studentFee.summary?.remainingFee > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPaymentForm((p) => ({
                              ...p,
                              amount: String(studentFee.summary.remainingFee),
                            }))
                          }
                          className="text-sm px-3 py-1.5 rounded-lg border border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
                        >
                          Use full remaining ({formatCurrency(studentFee.summary.remainingFee)})
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      Amounts greater than the monthly fee are applied from the earliest unpaid month
                      through the academic year (including partial months like August).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Month *
                        </label>
                        <select
                          value={paymentForm.paymentMonth}
                          onChange={(e) =>
                            setPaymentForm((p) => ({
                              ...p,
                              paymentMonth: Number(e.target.value),
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          {MONTH_OPTIONS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year *
                        </label>
                        <input
                          type="number"
                          min="2020"
                          max="2100"
                          value={paymentForm.paymentYear}
                          onChange={(e) =>
                            setPaymentForm((p) => ({ ...p, paymentYear: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount (₹) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={paymentForm.amount}
                          onChange={(e) =>
                            setPaymentForm((p) => ({ ...p, amount: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment mode *
                        </label>
                        <select
                          value={paymentForm.paymentMode}
                          onChange={(e) =>
                            setPaymentForm((p) => ({ ...p, paymentMode: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          {PAYMENT_MODES.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Receipt no.
                        </label>
                        <input
                          type="text"
                          value={paymentForm.receiptNumber}
                          onChange={(e) =>
                            setPaymentForm((p) => ({ ...p, receiptNumber: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="e.g. RCPT-2026-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remarks
                        </label>
                        <input
                          type="text"
                          value={paymentForm.remarks}
                          onChange={(e) =>
                            setPaymentForm((p) => ({ ...p, remarks: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={handleRecordPayment}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <ClockIcon className="h-5 w-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-5 w-5" />
                            Record Payment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Scholar no."
                  value={historyFilters.scholar_no}
                  onChange={(e) =>
                    setHistoryFilters((f) => ({ ...f, scholar_no: e.target.value }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <select
                  value={historyFilters.payment_status}
                  onChange={(e) =>
                    setHistoryFilters((f) => ({ ...f, payment_status: e.target.value }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  {PAYMENT_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  value={historyFilters.payment_month}
                  onChange={(e) =>
                    setHistoryFilters((f) => ({ ...f, payment_month: e.target.value }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All months</option>
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Year"
                  value={historyFilters.payment_year}
                  onChange={(e) =>
                    setHistoryFilters((f) => ({ ...f, payment_year: e.target.value }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <button
                type="button"
                onClick={loadPaymentHistory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply filters
              </button>

              {historyLoading ? (
                <p className="text-gray-500 py-8 text-center">Loading payments...</p>
              ) : allPayments.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">No payments found.</p>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Scholar</th>
                        <th className="px-4 py-3">Period</th>
                        <th className="px-4 py-3">Paid</th>
                        <th className="px-4 py-3">Due</th>
                        <th className="px-4 py-3">Mode</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Receipt</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allPayments.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{p.studentName || "—"}</td>
                          <td className="px-4 py-3">{p.scholarNumber || "—"}</td>
                          <td className="px-4 py-3">
                            {monthLabel(p.paymentMonth)} {p.paymentYear}
                          </td>
                          <td className="px-4 py-3 font-medium text-green-700">
                            {formatCurrency(p.paidAmount)}
                          </td>
                          <td className="px-4 py-3">{formatCurrency(p.dueAmount)}</td>
                          <td className="px-4 py-3">{p.paymentMode}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${statusBadgeClass(
                                p.paymentStatus
                              )}`}
                            >
                              {p.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">{p.receiptNumber || "—"}</td>
                          <td className="px-4 py-3">{formatDate(p.paymentDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
