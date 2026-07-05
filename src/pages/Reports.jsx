import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  AcademicCapIcon, 
  UserGroupIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { studentService } from '../services/studentService';
import { teacherService } from '../services/teacherService';
import { classService } from '../services/classService';
import { examService } from '../services/examService';
import { attendanceService } from '../services/attendanceService';
import { teacherAttendanceService } from '../services/teacherAttendanceService';
import { salaryService } from '../services/salaryService';
import { feeService } from '../services/feeService';
import { parseClassKey } from '../utils/attendanceUtils';

const MONTHLY_REPORTS = [
  'attendance-summary',
  'teacher-attendance',
  'salary-statement',
  'student-fees',
];

const monthYearLabel = (month, year) =>
  new Date(Number(year), Number(month) - 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    class: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: '',
    endDate: ''
  });

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [classesData, studentsData, teachersData] = await Promise.all([
        classService.getAllClasses(),
        studentService.getAllStudents(),
        teacherService.getAllTeachers()
      ]);

      setClasses(classesData.classes || []);
      // studentService.getAllStudents returns an array
      setStudents(Array.isArray(studentsData) ? studentsData : (studentsData.students || []));
      setTeachers(teachersData.teachers || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedReport) {
      setError('Please select a report type');
      return;
    }

    try {
      setLoading(true);
      setError('');
      let data = null;

      switch (selectedReport) {
        case 'student-list':
          data = await generateStudentListReport();
          break;
        case 'teacher-list':
          data = await generateTeacherListReport();
          break;
        case 'class-summary':
          data = await generateClassSummaryReport();
          break;
        case 'attendance-summary':
          data = await generateAttendanceSummaryReport();
          break;
        case 'exam-results':
          data = await generateExamResultsReport();
          break;
        case 'teacher-attendance':
          data = await generateTeacherAttendanceReport();
          break;
        case 'salary-statement':
          data = await generateSalaryStatementReport();
          break;
        case 'student-fees':
          data = await generateStudentFeesReport();
          break;
        default:
          setError('Invalid report type');
          return;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateStudentListReport = async () => {
    let filteredStudents = [...students];
    
    if (filters.class) {
      const selectedClass = classes.find(c => c._id === filters.class);
      if (selectedClass) {
        filteredStudents = students.filter(s => 
          s.className === selectedClass.name && s.section === selectedClass.section
        );
      }
    }

    return {
      title: 'Student List Report',
      type: 'student-list',
      data: filteredStudents,
      summary: {
        total: filteredStudents.length,
        byClass: filteredStudents.reduce((acc, student) => {
          const key = `${student.className}-${student.section}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {}),
        byGender: filteredStudents.reduce((acc, student) => {
          acc[student.gender] = (acc[student.gender] || 0) + 1;
          return acc;
        }, {})
      }
    };
  };

  const generateTeacherListReport = async () => {
    return {
      title: 'Teacher List Report',
      type: 'teacher-list',
      data: teachers,
      summary: {
        total: teachers.length,
        byDepartment: teachers.reduce((acc, teacher) => {
          acc[teacher.department] = (acc[teacher.department] || 0) + 1;
          return acc;
        }, {}),
        byStatus: teachers.reduce((acc, teacher) => {
          acc[teacher.status] = (acc[teacher.status] || 0) + 1;
          return acc;
        }, {})
      }
    };
  };

  const generateClassSummaryReport = async () => {
    const classSummary = classes.map(cls => {
      const classStudents = students.filter(s => 
        s.className === cls.name && s.section === cls.section
      );
      
      return {
        className: cls.name,
        section: cls.section,
        totalStudents: classStudents.length,
        maleStudents: classStudents.filter(s => s.gender === 'Male').length,
        femaleStudents: classStudents.filter(s => s.gender === 'Female').length,
        classTeacher: cls.classTeacher || 'Not Assigned'
      };
    });

    return {
      title: 'Class Summary Report',
      type: 'class-summary',
      data: classSummary,
      summary: {
        totalClasses: classes.length,
        totalStudents: students.length,
        averageClassSize: students.length / classes.length
      }
    };
  };

  const generateAttendanceSummaryReport = async () => {
    if (!filters.class) {
      throw new Error('Class selection is required for attendance report');
    }

    try {
      const selectedClass = classes.find((c) => c._id === filters.class);
      const attendanceData = await attendanceService.getMonthlyReport(
        filters.class,
        filters.month,
        filters.year
      );

      const rows = (attendanceData.studentAttendance || []).map((row) => ({
        studentName: row.student?.name || "",
        rollNo: row.student?.rollNo || "",
        totalDays: row.statistics?.totalDays ?? 0,
        present: row.statistics?.presentDays ?? 0,
        absent: row.statistics?.absentDays ?? 0,
        leave: row.statistics?.leaveDays ?? 0,
        percentage: `${row.statistics?.attendancePercentage ?? 0}%`,
      }));

      return {
        title: `Monthly Attendance — ${selectedClass?.name || "Class"} Section ${selectedClass?.section || ""}`,
        type: 'attendance-summary',
        data: rows,
        summary: {
          totalStudents: attendanceData.totalStudents || rows.length,
          month: filters.month,
          year: filters.year,
          averageAttendance: attendanceData.averageAttendance ?? 0,
        },
      };
    } catch (error) {
      throw new Error('Failed to fetch attendance data');
    }
  };

  const generateExamResultsReport = async () => {
    try {
      const examsData = await examService.getAllExams();
      const exams = examsData.exams || [];

      if (filters.class) {
        const selectedClass = classes.find(c => c._id === filters.class);
        if (selectedClass) {
          const classExams = exams.filter(exam => String(exam.class?._id || exam.class) === String(selectedClass._id));
          return {
            title: 'Exam Results Report',
            type: 'exam-results',
            data: classExams,
            summary: {
              totalExams: classExams.length,
              class: selectedClass.name,
              section: selectedClass.section
            }
          };
        }
      }

      return {
        title: 'Exam Results Report',
        type: 'exam-results',
        data: exams,
        summary: {
          totalExams: exams.length,
          byClass: exams.reduce((acc, exam) => {
            acc[exam.class] = (acc[exam.class] || 0) + 1;
            return acc;
          }, {})
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch exam data');
    }
  };

  const generateTeacherAttendanceReport = async () => {
    const report = await teacherAttendanceService.getMonthlyReport(
      filters.month,
      filters.year,
      teachers
    );

    const rows = (report.teacherAttendance || []).map((row) => ({
      employeeName: row.teacher?.name || '',
      employeeId: row.teacher?.employeeId || '',
      teacherId: row.teacher?.teacherId || '',
      totalDays: row.statistics?.totalDays ?? 0,
      present: row.statistics?.presentDays ?? 0,
      absent: row.statistics?.absentDays ?? 0,
      leave: row.statistics?.leaveDays ?? 0,
      percentage: `${row.statistics?.attendancePercentage ?? 0}%`,
    }));

    return {
      title: `Employee Attendance — ${monthYearLabel(filters.month, filters.year)}`,
      type: 'teacher-attendance',
      data: rows,
      summary: {
        totalEmployees: report.totalEmployees || rows.length,
        month: filters.month,
        year: filters.year,
        averageAttendance: report.averageAttendance ?? 0,
      },
    };
  };

  const generateSalaryStatementReport = async () => {
    const monthKey = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
    const data = await salaryService.getRecords({ month: monthKey });
    const records = data.salary || [];

    const rows = records.map((record) => ({
      employeeName: record.employeeName || '',
      employeeId: record.employeeId || '',
      teacherId: record.teacherId || '',
      salaryMonth: record.salaryPeriod || monthYearLabel(filters.month, filters.year),
      monthlyBasic: record.basicSalary ?? 0,
      monthlyAllowances: record.allowances ?? 0,
      monthlyDeductions: record.deductions ?? 0,
      monthlyNet: record.netSalary ?? 0,
      paidAmount: record.paidAmount ?? 0,
      status: record.status || 'Pending',
      paymentMode: record.paymentMode || '',
    }));

    const totalNet = rows.reduce((sum, row) => sum + Number(row.monthlyNet || 0), 0);
    const totalPaid = rows.reduce((sum, row) => sum + Number(row.paidAmount || 0), 0);

    return {
      title: `Monthly Salary Statement — ${monthYearLabel(filters.month, filters.year)}`,
      type: 'salary-statement',
      data: rows,
      summary: {
        totalEmployees: rows.length,
        month: filters.month,
        year: filters.year,
        totalMonthlyNet: totalNet,
        totalPaid,
      },
    };
  };

  const generateStudentFeesReport = async () => {
    const payments = await feeService.listPayments({
      payment_month: filters.month,
      payment_year: filters.year,
    });

    let filtered = payments;
    if (filters.class) {
      const parsed = parseClassKey(filters.class);
      if (parsed?.classId) {
        filtered = payments.filter(
          (payment) =>
            Number(payment.class_id) === Number(parsed.classId) &&
            (!parsed.sectionId ||
              Number(payment.section_id) === Number(parsed.sectionId))
        );
      }
    }

    const rows = filtered.map((payment) => ({
      studentName: payment.student_name || '',
      scholarNumber: payment.scholar_no || payment.admission_no || '',
      feeMonth: monthYearLabel(payment.payment_month || filters.month, payment.payment_year || filters.year),
      paidAmount: payment.paid_amount ?? payment.paidAmount ?? 0,
      dueAmount: payment.due_amount ?? payment.dueAmount ?? 0,
      status: payment.payment_status || payment.paymentStatus || 'PENDING',
      paymentMode: payment.payment_mode || payment.paymentMode || '',
      receiptNumber: payment.receipt_no || payment.receiptNumber || '',
      paymentDate: payment.payment_date
        ? new Date(payment.payment_date).toLocaleDateString('en-IN')
        : '',
    }));

    const totalPaid = rows.reduce((sum, row) => sum + Number(row.paidAmount || 0), 0);
    const totalDue = rows.reduce((sum, row) => sum + Number(row.dueAmount || 0), 0);

    return {
      title: `Monthly Student Fees — ${monthYearLabel(filters.month, filters.year)}`,
      type: 'student-fees',
      data: rows,
      summary: {
        totalRecords: rows.length,
        month: filters.month,
        year: filters.year,
        totalPaid,
        totalDue,
      },
    };
  };

  const exportReport = () => {
    if (!reportData) return;

    let csvContent = '';
    let filename = '';

    switch (reportData.type) {
      case 'student-list':
        filename = `student-list-${new Date().toISOString().split('T')[0]}.csv`;
        csvContent = generateStudentCSV(reportData.data);
        break;
      case 'teacher-list':
        filename = `teacher-list-${new Date().toISOString().split('T')[0]}.csv`;
        csvContent = generateTeacherCSV(reportData.data);
        break;
      case 'class-summary':
        filename = `class-summary-${new Date().toISOString().split('T')[0]}.csv`;
        csvContent = generateClassSummaryCSV(reportData.data);
        break;
      case 'attendance-summary':
        filename = `attendance-summary-${filters.month}-${filters.year}.csv`;
        csvContent = generateAttendanceCSV(reportData.data);
        break;
      case 'exam-results':
        filename = `exam-results-${new Date().toISOString().split('T')[0]}.csv`;
        csvContent = generateExamResultsCSV(reportData.data);
        break;
      case 'teacher-attendance':
        filename = `teacher-attendance-${filters.month}-${filters.year}.csv`;
        csvContent = generateTeacherAttendanceCSV(reportData.data);
        break;
      case 'salary-statement':
        filename = `salary-statement-${filters.month}-${filters.year}.csv`;
        csvContent = generateSalaryStatementCSV(reportData.data);
        break;
      case 'student-fees':
        filename = `student-fees-${filters.month}-${filters.year}.csv`;
        csvContent = generateStudentFeesCSV(reportData.data);
        break;
      default:
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateStudentCSV = (students) => {
    const headers = ['Name', 'Scholar Number', 'Class', 'Section', 'Gender', 'Roll No', 'Email', 'Phone'];
    const rows = students.map(s => [
      `${s.firstName} ${s.lastName}`,
      s.scholarNumber,
      s.className,
      s.section,
      s.gender,
      s.rollNo,
      s.emailAddress,
      s.phoneNumber
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateTeacherCSV = (teachers) => {
    const headers = ['Name', 'Enrollment No', 'Department', 'Designation', 'Email', 'Contact', 'Status'];
    const rows = teachers.map(t => [
      t.name,
      t.enrollmentNo,
      t.department,
      t.designation,
      t.email,
      t.contact,
      t.status
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateClassSummaryCSV = (classes) => {
    const headers = ['Class', 'Section', 'Total Students', 'Male', 'Female', 'Class Teacher'];
    const rows = classes.map(c => [
      c.className,
      c.section,
      c.totalStudents,
      c.maleStudents,
      c.femaleStudents,
      c.classTeacher
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateAttendanceCSV = (attendance) => {
    const headers = ['Student Name', 'Roll No', 'Total Days', 'Present', 'Absent', 'Leave', 'Percentage'];
    const rows = attendance.map((a) => [
      a.studentName ?? a.student?.name,
      a.rollNo ?? a.student?.rollNo,
      a.totalDays ?? a.statistics?.totalDays,
      a.present ?? a.statistics?.presentDays,
      a.absent ?? a.statistics?.absentDays,
      a.leave ?? a.statistics?.leaveDays,
      a.percentage ?? `${a.statistics?.attendancePercentage ?? 0}%`,
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateExamResultsCSV = (exams) => {
    const headers = ['Title', 'Subject', 'Class', 'Exam Date', 'Duration', 'Total Marks'];
    const rows = exams.map(e => [
      e.title,
      (typeof e.subject === 'object' ? e.subject?.name : e.subject),
      (typeof e.class === 'object' ? `${e.class?.name || ''} ${e.class?.section || ''}`.trim() : e.class),
      e.examDate ? new Date(e.examDate).toLocaleDateString() : '',
      e.duration,
      e.totalMarks
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateTeacherAttendanceCSV = (rows) => {
    const headers = ['Employee Name', 'Employee ID', 'Teacher ID', 'Total Days', 'Present', 'Absent', 'Leave', 'Percentage'];
    const data = rows.map((r) => [
      r.employeeName,
      r.employeeId,
      r.teacherId,
      r.totalDays,
      r.present,
      r.absent,
      r.leave,
      r.percentage,
    ]);
    return [headers, ...data].map((row) => row.join(',')).join('\n');
  };

  const generateSalaryStatementCSV = (rows) => {
    const headers = [
      'Employee Name',
      'Employee ID',
      'Teacher ID',
      'Salary Month',
      'Monthly Basic',
      'Monthly Allowances',
      'Monthly Deductions',
      'Monthly Net',
      'Paid Amount',
      'Status',
      'Payment Mode',
    ];
    const data = rows.map((r) => [
      r.employeeName,
      r.employeeId,
      r.teacherId,
      r.salaryMonth,
      r.monthlyBasic,
      r.monthlyAllowances,
      r.monthlyDeductions,
      r.monthlyNet,
      r.paidAmount,
      r.status,
      r.paymentMode,
    ]);
    return [headers, ...data].map((row) => row.join(',')).join('\n');
  };

  const generateStudentFeesCSV = (rows) => {
    const headers = [
      'Student Name',
      'Scholar Number',
      'Fee Month',
      'Paid Amount',
      'Due Amount',
      'Status',
      'Payment Mode',
      'Receipt Number',
      'Payment Date',
    ];
    const data = rows.map((r) => [
      r.studentName,
      r.scholarNumber,
      r.feeMonth,
      r.paidAmount,
      r.dueAmount,
      r.status,
      r.paymentMode,
      r.receiptNumber,
      r.paymentDate,
    ]);
    return [headers, ...data].map((row) => row.join(',')).join('\n');
  };

  const formatSummaryValue = (key, value) => {
    if (typeof value === 'number' && (key.toLowerCase().includes('amount') || key.toLowerCase().includes('net') || key.toLowerCase().includes('paid') || key.toLowerCase().includes('due'))) {
      return `₹${Number(value).toLocaleString('en-IN')}`;
    }
    if (typeof value === 'number' && key.toLowerCase().includes('percentage')) {
      return `${value.toFixed(1)}%`;
    }
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (loading && !reportData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="text-sm text-gray-600">
          Generate comprehensive reports for school management
        </div>
      </div>

      {/* Report Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Report Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'student-list', title: 'Student List', icon: UserGroupIcon, description: 'Complete student roster with details' },
            { id: 'teacher-list', title: 'Teacher List', icon: AcademicCapIcon, description: 'Staff directory and information' },
            { id: 'class-summary', title: 'Class Summary', icon: DocumentTextIcon, description: 'Class-wise student distribution' },
            { id: 'attendance-summary', title: 'Student Attendance', icon: CalendarIcon, description: 'Monthly student attendance by class' },
            { id: 'teacher-attendance', title: 'Employee Attendance', icon: ClipboardDocumentListIcon, description: 'Monthly teacher/employee attendance' },
            { id: 'salary-statement', title: 'Salary Statement', icon: CurrencyDollarIcon, description: 'Monthly salary statement for all employees' },
            { id: 'student-fees', title: 'Student Fees', icon: BanknotesIcon, description: 'Monthly student fee payments' },
            { id: 'exam-results', title: 'Exam Results', icon: ChartBarIcon, description: 'Examination performance data' }
          ].map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedReport === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <report.icon className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">{report.title}</h3>
              <p className="text-sm text-gray-600">{report.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {selectedReport && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MONTHLY_REPORTS.includes(selectedReport) && (
              <>
                {selectedReport === 'attendance-summary' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                    <select
                      value={filters.class}
                      onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name} - Section {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedReport === 'student-fees' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class (optional)</label>
                    <select
                      value={filters.class}
                      onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Classes</option>
                      {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name} - Section {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={filters.month}
                    onChange={(e) => setFilters(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="2020"
                    max="2030"
                  />
                </div>
              </>
            )}
            
            {(selectedReport === 'student-list' || selectedReport === 'exam-results') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={filters.class}
                  onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - Section {cls.section}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <ChartBarIcon className="h-4 w-4" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Report Results */}
      {reportData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{reportData.title}</h3>
              <button
                onClick={exportReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Report Summary */}
          {reportData.summary && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatSummaryValue(key, value)}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Data */}
          <div className="p-6">
            {reportData.data && reportData.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(reportData.data[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.data.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No data available for this report</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;