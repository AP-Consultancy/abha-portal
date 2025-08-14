import React, { useState, useEffect } from 'react';
import { CalendarIcon, CheckIcon, XMarkIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { attendanceService } from '../services/attendanceService';
import { classService } from '../services/classService';

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // School days configuration (Monday to Saturday)
  const schoolDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchClassAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getAllClasses();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setMessage('Error loading classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassAttendance = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getClassAttendance(selectedClass, selectedDate);
      setStudents(data.attendance || []);
      
      // Create attendance map
      const attendanceMap = {};
      data.attendance?.forEach(item => {
        if (item.attendance) {
          attendanceMap[item.student._id] = item.attendance.status;
        }
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setMessage('Error loading attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const attendanceData = students.map(item => ({
        studentId: item.student._id,
        status: attendance[item.student._id] || 'Present',
        remarks: ''
      }));

      await attendanceService.markBulkAttendance({
        classId: selectedClass,
        date: selectedDate,
        attendanceData
      });

      setMessage('Attendance saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setMessage('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800 border-green-200';
      case 'Absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'Late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Half Day': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <CheckIcon className="h-4 w-4" />;
      case 'Absent': return <XMarkIcon className="h-4 w-4" />;
      case 'Late': return <ClockIcon className="h-4 w-4" />;
      case 'Half Day': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return null;
    }
  };

  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0; // Sunday
  };

  if (loading && !selectedClass) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <div className="text-sm text-gray-600">
          School Days: Monday - Saturday
        </div>
      </div>

      {/* Class and Date Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - Section {cls.section}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {isWeekend(selectedDate) && (
              <p className="text-sm text-orange-600 mt-1">
                ⚠️ Selected date is a Sunday (weekend)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-3 rounded-lg ${
          message.includes('Error') 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Attendance Table */}
      {selectedClass && selectedDate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Mark Attendance - {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <button
                onClick={saveAttendance}
                disabled={saving || students.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg">Loading students...</div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found in this class</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scholar No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((item, index) => (
                    <tr key={item.student._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.student.rollNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.student.scholarNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={attendance[item.student._id] || 'Present'}
                          onChange={(e) => handleAttendanceChange(item.student._id, e.target.value)}
                          className={`border rounded-lg px-3 py-2 text-sm font-medium ${getStatusColor(attendance[item.student._id] || 'Present')}`}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                          <option value="Half Day">Half Day</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Select a class and date to mark attendance</li>
          <li>• School operates Monday to Saturday</li>
          <li>• Mark each student as Present, Absent, Late, or Half Day</li>
          <li>• Click "Save Attendance" to record the data</li>
          <li>• Attendance can be updated multiple times per day</li>
        </ul>
      </div>
    </div>
  );
};

export default Attendance;