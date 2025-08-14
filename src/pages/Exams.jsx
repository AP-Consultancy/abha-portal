import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  BookOpenIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { examService } from "../services/examService";
import { subjectService } from "../services/subjectService";
import { classService } from "../services/classService";
import CSVUpload from "../components/common/CSVUpload";
import { API_BASE_URL } from "../utils/constants";

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [examResults, setExamResults] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterExamType, setFilterExamType] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    class: "",
    teacher: "",
    examDate: "",
    startTime: "",
    endTime: "",
    duration: "",
    totalMarks: "",
    room: "",
    examType: "",
    instructions: "",
  });

  // State for dropdowns - will be populated from API
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // CSV Upload state
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchExams();
    fetchDropdownData();
  }, []);

  // CSV Upload handler
  const handleCSVUpload = async (formData, file) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/exams/bulk-upload`, {
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
      
      // Refresh the exams list after successful upload
      await fetchExams();
    } catch (error) {
      console.error('CSV upload error:', error);
      throw error;
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await examService.getAllExams();
      setExams(data.exams || data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch subjects
      const subjectsData = await subjectService.getAllSubjects();
      setSubjects(subjectsData.subjects || subjectsData || []);

      // Fetch classes
      const classesData = await classService.getAllClasses();
      setClasses(classesData.classes || classesData || []);

      // TODO: Fetch teachers when teacherService is available
      // const teachersData = await teacherService.getAllTeachers();
      // setTeachers(teachersData.teachers || teachersData || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleCreateExam = async (examData) => {
    try {
      await examService.createExam(examData);
      fetchExams(); // Refresh the list
      setShowForm(false);
      setFormData({
        title: "",
        subject: "",
        class: "",
        teacher: "",
        examDate: "",
        startTime: "",
        endTime: "",
        duration: "",
        totalMarks: "",
        room: "",
        examType: "",
        instructions: "",
      });
    } catch (error) {
      console.error("Error creating exam:", error);
    }
  };

  const handleUpdateExam = async (examId, examData) => {
    try {
      await examService.updateExam(examId, examData);
      fetchExams(); // Refresh the list
      setEditingExam(null);
    } catch (error) {
      console.error("Error updating exam:", error);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await examService.deleteExam(examId);
        fetchExams(); // Refresh the list
      } catch (error) {
        console.error("Error deleting exam:", error);
      }
    }
  };

  const handleViewResults = async (examId) => {
    try {
      const results = await examService.getExamResults(examId);
      setExamResults(results.results || results || []);
      setSelectedExamId(examId);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching exam results:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading exams...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Exams Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Exam</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterExamType}
            onChange={(e) => setFilterExamType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="midterm">Midterm</option>
            <option value="final">Final</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>
      </div>

      {/* CSV Upload Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Import Exams</h2>
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
            title="Upload Exam Data"
            description="Upload a CSV file to import multiple exams at once"
            entityType="exams"
            acceptedFileTypes=".csv,.xlsx,.xls"
            maxFileSize={10}
            showCredentialExport={false}
          />
        )}
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div key={exam._id || exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">{exam.title}</h3>
              <p className="text-blue-100 text-sm">{exam.subject?.name || exam.subject}</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{exam.examDate}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{exam.startTime} - {exam.endTime}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{exam.class?.name || exam.class}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <BookOpenIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{exam.totalMarks} marks</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Room:</span>
                  <span className="text-sm text-gray-900">{exam.room || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <span className="text-sm text-gray-900">{exam.examType || 'Not specified'}</span>
                </div>
              </div>
              
               <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => handleViewResults(exam._id || exam.id)}
                  className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => {
                    setEditingExam(exam);
                    setShowForm(false);
                    setFormData({
                      title: exam.title || '',
                      subject: exam.subject?._id || exam.subject || '',
                      class: exam.class?._id || exam.class || '',
                      teacher: exam.teacher?._id || exam.teacher || '',
                      examDate: exam.examDate ? String(exam.examDate).split('T')[0] : '',
                      startTime: exam.startTime || '',
                      endTime: exam.endTime || '',
                      duration: exam.duration || '',
                      totalMarks: exam.totalMarks || '',
                      room: exam.room || '',
                      examType: exam.examType || '',
                      instructions: exam.instructions || '',
                    });
                  }}
                  className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleDeleteExam(exam._id || exam.id)}
                  className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Exam Modal */}
      {(showForm || editingExam) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowForm(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{editingExam ? 'Edit Exam' : 'Add New Exam'}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id || subject.id} value={subject._id || subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select 
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls._id || cls.id} value={cls._id || cls.id}>
                          {cls.name} - {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                      <input 
                        type="date" 
                        value={formData.examDate}
                        onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                      <input 
                        type="number" 
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input 
                        type="time" 
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input 
                        type="time" 
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                    <input 
                      type="number" 
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <input 
                      type="text" 
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                    <select 
                      value={formData.examType}
                      onChange={(e) => setFormData({...formData, examType: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="midterm">Midterm</option>
                      <option value="final">Final</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <textarea 
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => editingExam ? handleUpdateExam(editingExam._id, formData) : handleCreateExam(formData)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingExam ? 'Save Changes' : 'Add Exam'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditingExam(null); }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Results Modal */}
      {showResults && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowResults(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Exam Results</h3>
                  <button
                    onClick={() => setShowResults(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {examResults.map((result) => (
                        <tr key={result._id || result.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.student?.name || result.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.student?.rollNo || result.rollNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.marksObtained}/{result.totalMarks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {((result.marksObtained / result.totalMarks) * 100).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.grade || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
