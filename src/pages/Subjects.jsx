import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { subjectService } from '../services/subjectService';
import { API_BASE_URL } from '../utils/constants';
import CSVUpload from '../components/common/CSVUpload';
import SubjectTable from '../components/subjects/SubjectTable';
import SubjectAssignModal from '../components/subjects/SubjectAssignModal';

const Subjects = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', grade: '', hoursPerWeek: 4, description: '' });
  const [addForm, setAddForm] = useState({ name: '', code: '', grade: '', hoursPerWeek: 4, description: '' });
  const [summary, setSummary] = useState(null);
  const [assignSubject, setAssignSubject] = useState(null);
  const [removingKey, setRemovingKey] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const [data, summaryRes] = await Promise.all([
        subjectService.getAllSubjects(),
        subjectService.getSubjectSummary().catch(() => null),
      ]);
      setSubjects(data.subjects || data || []);
      setSummary(summaryRes?.summary || null);
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

  const handleRemoveAssignment = async (subject, assignment) => {
    const subjectId = subject._id || subject.id;
    const removeKey = `${subjectId}-${assignment.assignmentId}`;
    if (
      !window.confirm(
        `Remove ${assignment.teacherName} from ${subject.name} (${assignment.classSectionLabel})?`
      )
    ) {
      return;
    }
    try {
      setRemovingKey(removeKey);
      await subjectService.removeTeacherAssignment(subjectId, assignment.assignmentId);
      await fetchSubjects();
    } catch (err) {
      console.error('Error removing teacher assignment:', err);
      setError(err.message || 'Failed to remove teacher assignment');
    } finally {
      setRemovingKey(null);
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
              Sample: <a href="/sample_subject_bulk_upload.csv" className="text-blue-600 underline" download>sample_subject_bulk_upload.csv</a>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects (master catalog)</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-3xl">
            The <strong>subjects</strong> table stores the subject list. Use{" "}
            <strong>Assign</strong> on each row to link a teacher + class + section, or use{" "}
            <strong>Employees → Add Teacher</strong> for full teacher profiles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAddForm({ name: '', code: '', grade: '', hoursPerWeek: 4, description: '' });
            setShowAddModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shrink-0"
        >
          <PlusIcon className="h-5 w-5" />
          Add subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Subjects in catalog</p>
          <p className="text-2xl font-bold text-gray-900">{summary?.totalSubjects ?? subjects.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Used in at least one class</p>
          <p className="text-2xl font-bold text-green-700">
            {summary?.subjectsWithAssignments ??
              subjects.filter((s) => s.hasAssignments).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Not assigned to any class yet</p>
          <p className="text-2xl font-bold text-amber-700">
            {summary?.subjectsUnassigned ??
              subjects.filter((s) => !s.hasAssignments).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Catalog hours / week (sum)</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary?.totalHoursPerWeek ??
              subjects.reduce((sum, s) => sum + Number(s.hoursPerWeek || 0), 0)}
          </p>
        </div>
      </div>

      <SubjectTable
        subjects={subjects}
        onAssign={(subject) => setAssignSubject(subject)}
        onRemoveAssignment={handleRemoveAssignment}
        removingKey={removingKey}
        onEdit={(subject) => {
          setEditingSubject(subject);
          setEditForm({
            name: subject.name || '',
            code: subject.code || '',
            grade: subject.grade || '',
            hoursPerWeek: subject.hoursPerWeek ?? 4,
            description: subject.description || '',
          });
        }}
        onDelete={(subject) => handleDeleteSubject(subject._id || subject.id)}
      />

      {assignSubject && (
        <SubjectAssignModal
          subject={assignSubject}
          onClose={() => setAssignSubject(null)}
          onSaved={() => fetchSubjects()}
        />
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add subject to catalog</h3>
                <p className="text-sm text-gray-500 mb-4">
                  This only creates a row in <code>subjects</code>. Link teachers via Employees.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                    <input
                      type="text"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                    <input
                      type="text"
                      value={addForm.code}
                      onChange={(e) => setAddForm({ ...addForm, code: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                      <input
                        type="text"
                        value={addForm.grade}
                        onChange={(e) => setAddForm({ ...addForm, grade: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hours / week</label>
                      <input
                        type="number"
                        min={0}
                        value={addForm.hoursPerWeek}
                        onChange={(e) =>
                          setAddForm({ ...addForm, hoursPerWeek: Number(e.target.value) })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={addForm.description}
                      onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={async () => {
                    await handleCreateSubject(addForm);
                    setShowAddModal(false);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save
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