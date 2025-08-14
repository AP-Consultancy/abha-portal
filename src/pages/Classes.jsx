import React, { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import { teacherService } from '../services/teacherService';
import { API_BASE_URL } from '../utils/constants';
import CSVUpload from '../components/common/CSVUpload';

const Classes = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', section: '', academicYear: '', classTeacher: '', room: '', capacity: 0, schedule: '' });
  const [teachers, setTeachers] = useState([]);
  const [subjectEdit, setSubjectEdit] = useState({ open: false, classItem: null, subjects: [] });
  const [teacherSubjectsCache, setTeacherSubjectsCache] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getAllClasses();
      setClasses(response.classes || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    // fetch teachers for edit modal dropdown
    (async () => {
      try {
        const data = await teacherService.getAllTeachers();
        setTeachers(data.teachers || []);
      } catch (e) {
        console.error('Error loading teachers:', e);
      }
    })();
    // load subjects for subject assignment modal
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/subjects`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
        if (res.ok) {
          const data = await res.json();
          setAllSubjects(data.subjects || data || []);
        }
      } catch (e) { console.error('Error loading subjects', e); }
    })();
  }, []);

  // CSV Upload handler
  const handleCSVUpload = async (formData, file) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/classes/bulk-upload`, {
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
      
      // Refresh the classes list after successful upload
      await fetchClasses();
    } catch (error) {
      console.error('CSV upload error:', error);
      throw error;
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classService.deleteClass(classId);
        // Refresh the classes list
        const response = await classService.getAllClasses();
        setClasses(response.classes || []);
      } catch (err) {
        console.error('Error deleting class:', err);
        setError('Failed to delete class');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes Management</h1>
          <p className="text-gray-600 mt-2">Manage all classes and their configurations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Class</span>
        </button>
      </div>

      {/* CSV Upload Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Import Classes</h2>
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
            title="Upload Class Data"
            description="Upload a CSV file to import multiple classes at once"
            entityType="classes"
            acceptedFileTypes=".csv,.xlsx,.xls"
            maxFileSize={10}
            showCredentialExport={false}
          />
        )}
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Classes Statistics */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-blue-600 font-semibold">🏫</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.reduce((total, classItem) => total + (classItem.students?.length || 0), 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-green-600 font-semibold">👥</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average per Class</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.length > 0 
                    ? Math.round(classes.reduce((total, classItem) => total + (classItem.students?.length || 0), 0) / classes.length)
                    : 0
                  }
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <span className="text-purple-600 font-semibold">📊</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.filter(classItem => classItem.status === 'Active').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <span className="text-yellow-600 font-semibold">✅</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Classes Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <span className="text-6xl">🏫</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
              <p className="text-gray-500">No classes have been created yet.</p>
            </div>
          ) : (
            classes.map((classItem) => (
              <div key={classItem._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">{classItem.name} - Section {classItem.section}</h3>
                  <p className="text-blue-100 text-sm">{classItem.room}</p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Class Teacher</span>
                      <span className="text-sm text-gray-900">{classItem.classTeacher?.name || 'Not assigned'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Students</span>
                      <span className="text-sm text-gray-900">{classItem.students?.length || 0}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Subjects</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {classItem.subjects?.map((subjectData, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {subjectData.subject?.name || 'Unknown'}
                          </span>
                        )) || <span className="text-gray-500 text-xs">No subjects assigned</span>}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Schedule</span>
                      <p className="text-sm text-gray-900 mt-1">{classItem.schedule}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                    <button className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingClass(classItem);
                        setEditForm({
                          name: classItem.name || '',
                          section: classItem.section || '',
                          academicYear: classItem.academicYear || '',
                          classTeacher: classItem.classTeacher?._id || '',
                          room: classItem.room || '',
                          capacity: classItem.capacity || 0,
                          schedule: classItem.schedule || '',
                        });
                      }}
                      className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                       <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSubjectEdit({ open: true, classItem, subjects: (classItem.subjects || []).map(s => ({ subjectId: s.subject?._id || '', teacherId: s.teacher?._id || '', hoursPerWeek: s.hoursPerWeek || 4 })) });
                      }}
                      className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      Assign Subjects
                    </button>
                    <button 
                      onClick={() => handleDeleteClass(classItem._id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Class</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Select Teacher</option>
                      <option>Ms. Sarah Johnson</option>
                      <option>Mr. David Smith</option>
                      <option>Dr. Jane Wilson</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Students</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Class
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

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setEditingClass(null)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Class</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                    <input type="text" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <input type="text" value={editForm.section} onChange={(e)=>setEditForm({...editForm, section: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                      <input type="text" value={editForm.academicYear} onChange={(e)=>setEditForm({...editForm, academicYear: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
                    <select value={editForm.classTeacher} onChange={(e)=>setEditForm({...editForm, classTeacher: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Teacher</option>
                      {teachers.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                      <input type="text" value={editForm.room} onChange={(e)=>setEditForm({...editForm, room: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <input type="number" value={editForm.capacity} onChange={(e)=>setEditForm({...editForm, capacity: parseInt(e.target.value || '0', 10)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                    <input type="text" value={editForm.schedule} onChange={(e)=>setEditForm({...editForm, schedule: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={async () => {
                    try {
                      // if only class teacher changed, use dedicated endpoint; otherwise update class
                      if (editForm.classTeacher && editForm.classTeacher !== (editingClass.classTeacher?._id || '')) {
                        await classService.assignClassTeacher(editingClass._id, editForm.classTeacher);
                      }
                      await classService.updateClass(editingClass._id, {
                        name: editForm.name,
                        section: editForm.section,
                        academicYear: editForm.academicYear,
                        room: editForm.room,
                        capacity: editForm.capacity,
                        schedule: editForm.schedule,
                      });
                      setEditingClass(null);
                      fetchClasses();
                    } catch (e) { console.error('Failed to update class', e); }
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingClass(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject Assignment Modal */}
      {subjectEdit.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSubjectEdit({ open: false, classItem: null, subjects: [] })}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Subjects - {subjectEdit.classItem?.name} {subjectEdit.classItem?.section}</h3>
                <div className="space-y-3">
                  {subjectEdit.subjects.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        {(() => {
                          const options = (row.teacherId && teacherSubjectsCache[row.teacherId]?.length)
                            ? teacherSubjectsCache[row.teacherId]
                            : allSubjects;
                          return (
                            <select value={row.subjectId} onChange={(e)=>{
                              const s = [...subjectEdit.subjects]; s[idx].subjectId = e.target.value; setSubjectEdit({ ...subjectEdit, subjects: s });
                            }} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                              <option value="">Select Subject</option>
                              {options.map(s=> (<option key={s._id} value={s._id}>{s.name}</option>))}
                            </select>
                          );
                        })()}
                      </div>
                      <div className="col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                        <select value={row.teacherId} onChange={async (e)=>{
                          const teacherId = e.target.value;
                          const s = [...subjectEdit.subjects];
                          s[idx].teacherId = teacherId;
                          setSubjectEdit({ ...subjectEdit, subjects: s });

                          if (teacherId && !teacherSubjectsCache[teacherId]) {
                            try {
                              const data = await subjectService.getSubjectsByTeacher(teacherId);
                              const subjects = data.subjects || [];
                              setTeacherSubjectsCache(prev => ({ ...prev, [teacherId]: subjects }));
                              const allowedIds = new Set(subjects.map(x => x._id));
                              if (s[idx].subjectId && !allowedIds.has(s[idx].subjectId)) {
                                const s2 = [...s];
                                s2[idx].subjectId = '';
                                setSubjectEdit(prev => ({ ...prev, subjects: s2 }));
                              }
                            } catch (err) {
                              console.error('Failed to load subjects for teacher', err);
                            }
                          }
                        }} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option value="">Select Teacher</option>
                          {teachers.map(t => (<option key={t._id} value={t._id}>{t.name}</option>))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                        <input type="number" min={1} value={row.hoursPerWeek} onChange={(e)=>{
                          const s = [...subjectEdit.subjects]; s[idx].hoursPerWeek = parseInt(e.target.value || '1', 10); setSubjectEdit({ ...subjectEdit, subjects: s });
                        }} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                      </div>
                    </div>
                  ))}
                  <button onClick={()=> setSubjectEdit({ ...subjectEdit, subjects: [...subjectEdit.subjects, { subjectId: '', teacherId: '', hoursPerWeek: 4 }] })} className="mt-2 text-sm text-blue-600">+ Add Subject</button>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={async () => {
                    try {
                      const filtered = subjectEdit.subjects.filter(s => s.subjectId && s.teacherId && Number(s.hoursPerWeek) > 0);
                      await classService.setClassSubjects(subjectEdit.classItem._id, filtered);
                      setSubjectEdit({ open: false, classItem: null, subjects: [] });
                      fetchClasses();
                    } catch (e) { console.error('Failed to set class subjects', e); }
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Assignments
                </button>
                <button
                  onClick={() => setSubjectEdit({ open: false, classItem: null, subjects: [] })}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;