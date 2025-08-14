import React, { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { subjectService } from '../services/subjectService';
import { API_BASE_URL } from '../utils/constants';
import CSVUpload from '../components/common/CSVUpload';

const Subjects = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', grade: '', hoursPerWeek: 0, description: '' });

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getAllSubjects();
      setSubjects(data.subjects || data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subjects');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (subjectData) => {
    try {
      await subjectService.createSubject(subjectData);
      fetchSubjects(); // Refresh the list
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating subject:', err);
      // Handle error (show toast, etc.)
    }
  };

  const handleUpdateSubject = async (subjectId, subjectData) => {
    try {
      await subjectService.updateSubject(subjectId, subjectData);
      fetchSubjects(); // Refresh the list
    } catch (err) {
      console.error('Error updating subject:', err);
      // Handle error (show toast, etc.)
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectService.deleteSubject(subjectId);
        fetchSubjects(); // Refresh the list
      } catch (err) {
        console.error('Error deleting subject:', err);
        // Handle error (show toast, etc.)
      }
    }
  };

  const handleCSVUpload = async (formData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/subjects/bulk-upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Upload failed');
    }
    const result = await response.json();
    if (result.successful === 0 && result.failed > 0) {
      const preview = (result.failedSubjects || []).slice(0, 5)
        .map(e => `Row ${e.row}: ${e.reason}`).join(' | ');
      throw new Error(`All rows failed (${result.failed}/${result.total}). ${preview}`);
    }
    await fetchSubjects();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading subjects...</div>
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

  return (
    <div className="space-y-6">
      {/* Bulk Upload Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Import Subjects</h2>
          <button
            onClick={() => setShowCSVUpload(!showCSVUpload)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            {showCSVUpload ? 'Hide Upload' : 'Show Upload'}
          </button>
        </div>
        {showCSVUpload && (
          <>
            <CSVUpload
              onUpload={handleCSVUpload}
              title="Upload Subject Data"
              description="Upload a CSV file to import multiple subjects at once"
              entityType="subjects"
              acceptedFileTypes=".csv"
              maxFileSize={5}
            />
            <div className="mt-2 text-sm text-gray-600">
              Sample: server/sample_subject_upload.csv
            </div>
          </>
        )}
      </div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Subjects Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subjects Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-blue-600 font-semibold">📚</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Core Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.filter(s => s.type === 'core').length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="text-green-600 font-semibold">🎯</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Elective Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.filter(s => s.type === 'elective').length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <span className="text-purple-600 font-semibold">🎨</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hours/Week</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.reduce((sum, s) => sum + (s.hours || 0), 0)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <span className="text-yellow-600 font-semibold">⏰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div key={subject._id || subject.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
              <p className="text-indigo-100 text-sm">{subject.code}</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Teacher</span>
                  <span className="text-sm text-gray-900">{subject.teacher?.name || subject.teacher || 'Not Assigned'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Grade</span>
                  <span className="text-sm text-gray-900">{subject.grade || 'Not Specified'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Hours/Week</span>
                  <span className="text-sm text-gray-900">{subject.hours || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Students</span>
                  <span className="text-sm text-gray-900">{subject.students?.length || subject.students || 0}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Description</span>
                  <p className="text-sm text-gray-900 mt-1">{subject.description || 'No description available'}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors">
                  <PencilIcon className="h-5 w-5" onClick={() => {
                    setEditingSubject(subject);
                    setEditForm({
                      name: subject.name || '',
                      code: subject.code || '',
                      grade: subject.grade || '',
                      hoursPerWeek: subject.hoursPerWeek || subject.hours || 0,
                      description: subject.description || ''
                    });
                  }} />
                </button>
                <button 
                  onClick={() => handleDeleteSubject(subject._id || subject.id)}
                  className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Subject</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Select Teacher</option>
                      <option>Dr. Jane Smith</option>
                      <option>Mr. Robert Johnson</option>
                      <option>Ms. Sarah Wilson</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours per Week</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={3}></textarea>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Subject
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

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setEditingSubject(null)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Subject</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <input type="text" value={editForm.code} onChange={(e)=>setEditForm({...editForm, code: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                      <input type="text" value={editForm.grade} onChange={(e)=>setEditForm({...editForm, grade: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hours/Week</label>
                      <input type="number" value={editForm.hoursPerWeek} onChange={(e)=>setEditForm({...editForm, hoursPerWeek: parseInt(e.target.value || '0', 10)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={editForm.description} onChange={(e)=>setEditForm({...editForm, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={3} />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={async () => { try { await subjectService.updateSubject(editingSubject._id, editForm); setEditingSubject(null); fetchSubjects(); } catch (e) { console.error('Update subject failed', e); } }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button onClick={()=>setEditingSubject(null)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;