import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { subjectService } from '../services/subjectService';
import { teacherService } from '../services/teacherService';
import { PencilIcon } from '@heroicons/react/24/outline';
import { PlusIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import CSVUpload from '../components/common/CSVUpload';

const Timetable = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showAddModal, setShowAddModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodForm, setPeriodForm] = useState({ day: 'Monday', time: '', subjectId: '', teacherId: '', room: '' });
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '9:00 AM - 9:45 AM',
    '9:45 AM - 10:30 AM',
    '10:30 AM - 11:15 AM',
    '11:15 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 1:45 PM',
    '1:45 PM - 2:30 PM',
    '2:30 PM - 3:15 PM'
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchTimetableData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetableForClass(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    // load subjects and teachers for edit modal
    (async () => {
      try {
        const [subj, teach] = await Promise.all([
          subjectService.getAllSubjects(),
          teacherService.getAllTeachers(),
        ]);
        setSubjects(subj.subjects || subj || []);
        setTeachers(teach.teachers || teach || []);
      } catch (e) {
        console.error('Failed to load dropdowns', e);
      }
    })();
  }, []);

  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      // Fetch classes
      const classesRes = await fetch(`${API_BASE_URL}/api/classes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const classesJson = await classesRes.json();
      const fetchedClasses = classesJson.classes || [];
      setClasses(fetchedClasses);
      // Auto-select first class if none selected
      if (!selectedClass && fetchedClasses.length > 0) {
        setSelectedClass(fetchedClasses[0]._id || fetchedClasses[0].id);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch timetable data');
      console.error('Error fetching timetable data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetableForClass = async (classId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const ttRes = await fetch(`${API_BASE_URL}/api/timetable/class/${classId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const ttJson = await ttRes.json();
      const tt = ttJson.timetable || {};
      const normalized = { ...timetableData };
      normalized[classId] = tt.schedule || {};
      setTimetableData(normalized);
    } catch (err) {
      console.error('Error fetching timetable for class:', err);
    }
  };

  const handleAddPeriod = async (periodData) => {
    try {
      // TODO: Implement API call to add period
      // await timetableService.addPeriod(periodData);
      console.log('Adding period:', periodData);
      fetchTimetableData(); // Refresh the data
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding period:', err);
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    // Fetch timetable for the selected class
    fetchTimetableData();
  };

  // CSV Upload handler
  const handleCSVUpload = async (formData, file) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/timetable/bulk-upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch (e) {
          const text = await response.text().catch(() => '');
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json().catch(async () => {
        const text = await response.text().catch(() => '');
        return text ? { message: text } : {};
      });
      console.log('Upload result:', result);
      
      // Refresh for current class
      if (selectedClass) {
        await fetchTimetableForClass(selectedClass);
      } else {
        await fetchTimetableData();
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading timetable data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  const getCurrentSchedule = () => {
    const entries = timetableData[selectedClass]?.[selectedDay] || [];
    // Map populated docs to display strings
    return entries.map((e) => ({
      time: e.time,
      subject: typeof e.subject === 'object' ? e.subject?.name : e.subject,
      teacher: typeof e.teacher === 'object' ? e.teacher?.name : e.teacher,
      room: e.room,
      raw: e,
    }));
  };

  const asText = (val) => {
    if (!val) return '';
    if (typeof val === 'object') return val.name || '';
    return String(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Period</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <AcademicCapIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls._id || cls.id} value={cls._id || cls.id}>
                    {cls.name} - {cls.section}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Upload Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Import Timetable</h2>
          <button
            onClick={() => setShowCSVUpload(!showCSVUpload)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            {showCSVUpload ? 'Hide Upload' : 'Show Upload'}
          </button>
        </div>
        
        {showCSVUpload && (
          <CSVUpload
            onUpload={handleCSVUpload}
            title="Upload Timetable Data"
            description="Upload a CSV file to import multiple timetable entries at once"
            entityType="timetable entries"
            acceptedFileTypes=".csv,.xlsx,.xls"
            maxFileSize={10}
            showCredentialExport={false}
          />
        )}
      </div>

      {/* Timetable Display */}
      {!selectedClass ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AcademicCapIcon className="mx-auto h-16 w-16 text-gray-400 mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No class selected
          </h3>
          <p className="text-gray-600">
            Please select a class to view the timetable
          </p>
        </div>
      ) : (
        <>
          {/* Weekly View Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      selectedDay === day
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </nav>
            </div>

            {/* Timetable Grid */}
            <div className="p-6">
              {getCurrentSchedule().length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No periods scheduled for {selectedDay}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getCurrentSchedule().map((period, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      period.subject === 'Break' ? 'bg-gray-50 border-gray-400' :
                      period.subject === 'Lunch' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm font-medium text-gray-600">{period.time}</div>
                          <div className="text-lg font-semibold text-gray-900">{period.subject}</div>
                        </div>
                        <div className="text-right">
                          {period.teacher && <div className="text-sm text-gray-600">{period.teacher}</div>}
                          {period.room && <div className="text-sm text-gray-500">{period.room}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Weekly Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Overview - {classes.find(c => c._id === selectedClass || c.id === selectedClass)?.name || 'Selected Class'}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    {days.map(day => (
                      <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                      {timeSlots.map((timeSlot, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {timeSlot}
                      </td>
                      {days.map(day => {
                        const period = timetableData[selectedClass]?.[day]?.[index];
                        return (
                          <td key={day} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {period && (
                              <div className={`p-2 rounded text-xs ${
                                period.subject === 'Break' ? 'bg-gray-100' :
                                period.subject === 'Lunch' ? 'bg-yellow-100' :
                                'bg-blue-100'
                              }`}>
                                    <div className="flex items-center justify-between gap-2">
                                      <div>
                                        <div className="font-medium">{asText(period.subject)}</div>
                                        {period.teacher && <div className="text-gray-600">{asText(period.teacher)}</div>}
                                        {period.room && <div className="text-gray-500">{period.room}</div>}
                                      </div>
                                      <button
                                        title="Edit period"
                                        className="text-blue-700 hover:text-blue-900"
                                        onClick={() => {
                                          setPeriodForm({
                                            day,
                                            time: period.time || timeSlot,
                                            subjectId: period.subject?._id || '',
                                            teacherId: period.teacher?._id || '',
                                            room: period.room || '',
                                          });
                                          setShowPeriodModal(true);
                                        }}
                                      >
                                        <PencilIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Period Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Period</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls._id || cls.id} value={cls._id || cls.id}>
                          {cls.name} - {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Period
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Period Modal */}
      {showPeriodModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPeriodModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Period</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                      <select value={periodForm.day} onChange={(e)=>setPeriodForm({...periodForm, day: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input type="text" value={periodForm.time} onChange={(e)=>setPeriodForm({...periodForm, time: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select value={periodForm.subjectId} onChange={(e)=>setPeriodForm({...periodForm, subjectId: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                    <select value={periodForm.teacherId} onChange={(e)=>setPeriodForm({...periodForm, teacherId: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Teacher</option>
                      {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <input type="text" value={periodForm.room} onChange={(e)=>setPeriodForm({...periodForm, room: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                      await fetch(`${API_BASE_URL}/api/timetable/entry/upsert`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({
                          classId: selectedClass,
                          academicYear: classes.find(c => (c._id || c.id) === selectedClass)?.academicYear,
                          day: periodForm.day,
                          time: periodForm.time,
                          subjectId: periodForm.subjectId,
                          teacherId: periodForm.teacherId,
                          room: periodForm.room,
                        }),
                      });
                      setShowPeriodModal(false);
                      fetchTimetableForClass(selectedClass);
                    } catch (e) {
                      console.error('Failed to upsert period', e);
                    }
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button onClick={()=>setShowPeriodModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;