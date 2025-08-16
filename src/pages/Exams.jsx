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
import { teacherService } from "../services/teacherService";
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
    examType: "Unit Test",
    instructions: "",
  });

  // State for dropdowns - will be populated from API
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // CSV Upload state
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  // Bulk results modal state
  const [showBulkResultsModal, setShowBulkResultsModal] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchExams();
    fetchDropdownData();
  }, []);

  // CSV Upload handler (exams)
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
      setExams(data.exams || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([
        subjectService.getAllSubjects(),
        classService.getAllClasses(),
        teacherService.getAllTeachers(),
      ]);
      setSubjects(subjectsRes.subjects || subjectsRes || []);
      setClasses(classesRes.classes || classesRes || []);
      setTeachers(teachersRes.teachers || teachersRes || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewResults = async (examId) => {
    try {
      setSelectedExamId(examId);
      setShowResults(true);
      const res = await examService.getExamResults(examId);
      setExamResults(res.results || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteExam = async (examId) => {
    try {
      await examService.deleteExam(examId);
      fetchExams();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitExam = async () => {
    try {
      // Basic validation
      const required = ['title','subject','class','teacher','examDate','startTime','endTime','duration','totalMarks','examType'];
      const missing = required.filter((k)=> !String(formData[k] ?? '').trim());
      if (missing.length) { alert(`Please fill required fields: ${missing.join(', ')}`); return; }

      const payload = {
        title: formData.title,
        subject: formData.subject,
        class: formData.class,
        teacher: formData.teacher,
        examDate: formData.examDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
        room: formData.room,
        examType: formData.examType,
        instructions: formData.instructions,
      };

      if (editingExam) {
        await examService.updateExam(editingExam._id || editingExam.id, payload);
      } else {
        await examService.createExam(payload);
      }
      setShowForm(false);
      setEditingExam(null);
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
        examType: "Unit Test",
        instructions: "",
      });
      await fetchExams();
    } catch (e) {
      console.error('Failed to submit exam', e);
      alert(e.message || 'Failed to submit exam');
    }
  };

  const handleBulkResultsUpload = async (file) => {
    try {
      if (!selectedExamId) { alert('Select an exam first'); return; }
      const fd = new FormData();
      fd.append('csvFile', file);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/exams/${selectedExamId}/results/bulk-upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.message || 'Upload failed');
      alert(`Results uploaded: ${data.saved}/${data.total}`);
      setShowBulkResultsModal(false);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Upload failed');
    }
  };

  if (loading) {
    return <div className="p-6">Loading exams...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 inline" /> Add Exam
          </button>
          <button
            onClick={() => setShowCSVUpload(!showCSVUpload)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            {showCSVUpload ? 'Hide Upload' : 'Show Upload'}
          </button>
        </div>
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

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => {
          const isPast = exam.examDate && new Date(exam.examDate) < new Date();
          return (
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
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                    onClick={() => handleViewResults(exam._id || exam.id)}
                  >
                    View Results
                  </button>
                  {isPast && (
                    <button
                      className="px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
                      onClick={()=>{ setSelectedExamId(exam._id || exam.id); setShowBulkResultsModal(true); }}
                    >
                      Upload Results (CSV)
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                    <select 
                      value={formData.teacher}
                      onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((t) => (
                        <option key={t._id || t.id} value={t._id || t.id}>
                          {t.name}
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
                      <option>Unit Test</option>
                      <option>Mid Term</option>
                      <option>Final Term</option>
                      <option>Practical</option>
                      <option>Assignment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <textarea 
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSubmitExam}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingExam ? 'Save Changes' : 'Add Exam'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditingExam(null); }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowResults(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Results</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {examResults.map((result) => (
                        <tr key={result._id || result.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.student
                              ? `${result.student.firstName || ''} ${result.student.lastName || ''}`.trim() || result.student.enrollmentNo || 'Unknown'
                              : (result.studentName || 'Unknown')}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowResults(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Results Modal */}
      {showBulkResultsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={()=> setShowBulkResultsModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Results (CSV)</h3>
                <p className="text-sm text-gray-600 mb-3">Accepted headers: studentId, marksObtained, isAbsent</p>
                <input type="file" accept=".csv" onChange={async (e)=>{
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await handleBulkResultsUpload(file);
                  e.target.value='';
                }} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={()=> setShowBulkResultsModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
