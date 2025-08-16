import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  AcademicCapIcon, 
  UserGroupIcon,
  CalendarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { studentService } from '../services/studentService';
import { teacherService } from '../services/teacherService';
import { classService } from '../services/classService';
import { examService } from '../services/examService';
import { attendanceService } from '../services/attendanceService';

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
      const attendanceData = await attendanceService.getMonthlyReport(
        filters.class,
        filters.month,
        filters.year
      );

      return {
        title: 'Monthly Attendance Report',
        type: 'attendance-summary',
        data: attendanceData.studentAttendance || [],
        summary: {
          totalStudents: attendanceData.totalStudents || 0,
          month: filters.month,
          year: filters.year,
          averageAttendance: attendanceData.studentAttendance?.reduce((acc, student) => 
            acc + student.statistics.attendancePercentage, 0
          ) / (attendanceData.studentAttendance?.length || 1) || 0
        }
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
    const headers = ['Student Name', 'Roll No', 'Total Days', 'Present', 'Absent', 'Late', 'Half Day', 'Percentage'];
    const rows = attendance.map(a => [
      a.student.name,
      a.student.rollNo,
      a.statistics.totalDays,
      a.statistics.presentDays,
      a.statistics.absentDays,
      a.statistics.lateDays,
      a.statistics.halfDays,
      `${a.statistics.attendancePercentage}%`
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

  const formatSummaryValue = (key, value) => {
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
            { id: 'attendance-summary', title: 'Attendance Summary', icon: CalendarIcon, description: 'Monthly attendance statistics' },
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
            {selectedReport === 'attendance-summary' && (
              <>
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