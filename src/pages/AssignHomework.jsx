import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { homeworkService } from '../services/homeworkService';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const AssignHomework = () => {
  const { user, getUserRole } = useAuth();
  const userRole = getUserRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    deadline: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch homework data first
      const teacherId = user.userData?._id || user.id;
      const homeworkData = await homeworkService.getHomeworkByTeacher(teacherId);
      setHomeworkList(homeworkData.data || []);
      
      // Then fetch classes and subjects
      try {
        let classesData, subjectsData;
        
        // Use role-appropriate methods
        if (userRole === 'admin') {
          [classesData, subjectsData] = await Promise.all([
            classService.getAllClasses(),
            subjectService.getAllSubjects()
          ]);
        } else {
          const teacherId = user.userData?._id || user.id;
          [classesData, subjectsData] = await Promise.all([
            classService.getTeacherClasses(teacherId),
            subjectService.getSubjectsByTeacher(teacherId)
          ]);
        }
        
                 setClasses(Array.isArray(classesData?.classes) ? classesData.classes : Array.isArray(classesData?.data) ? classesData.data : []);
         setSubjects(Array.isArray(subjectsData?.subjects) ? subjectsData.subjects : Array.isArray(subjectsData?.data) ? subjectsData.data : []);
      } catch (err) {
        console.warn('Could not fetch classes/subjects:', err.message);
        setError('Unable to load class and subject data. Please try again later.');
        setClasses([]);
        setSubjects([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const homeworkData = {
        ...formData,
        teacherId: user.userData?._id || user.id,
        deadline: new Date(formData.deadline).toISOString()
      };

      const response = await homeworkService.createHomework(homeworkData);
      setSuccess('Homework assigned successfully!');
             setFormData({
         title: '',
         description: '',
         classId: '',
         subjectId: '',
         deadline: ''
       });
      setShowForm(false);
      
      // Refresh homework list
      const updatedHomework = await homeworkService.getHomeworkByTeacher(user.id);
      setHomeworkList(updatedHomework.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (homeworkId) => {
    if (window.confirm('Are you sure you want to delete this homework?')) {
      try {
        setLoading(true);
        await homeworkService.deleteHomework(homeworkId);
        setSuccess('Homework deleted successfully!');
        
        // Refresh homework list
        const updatedHomework = await homeworkService.getHomeworkByTeacher(user.id);
        setHomeworkList(updatedHomework.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !homeworkList.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Assign Homework
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage homework assignments for your classes
        </p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
          <button
            onClick={() => setSuccess('')}
            className="float-right font-bold text-green-700 hover:text-green-900"
          >
            ×
          </button>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : 'Assign New Homework'}
        </button>
                 {(!Array.isArray(classes) || !Array.isArray(subjects) || classes.length === 0 || subjects.length === 0) && (
          <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
            Note: Unable to load class or subject data. Please contact an administrator.
          </p>
        )}
      </div>

             {showForm && Array.isArray(classes) && Array.isArray(subjects) && classes.length > 0 && subjects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            New Homework Assignment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter homework title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class *
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                                                        <option value="">Select Class</option>
                                         {Array.isArray(classes) && classes.map((cls) => (
                       <option key={cls._id} value={cls._id}>
                         Class {cls.name} - Section {cls.section}
                       </option>
                     ))}
                </select>
              </div>
            </div>

            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deadline *
                </label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter homework description and requirements"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Assigning...' : 'Assign Homework'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Homework Assignments
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : homeworkList.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No homework assignments found. Create your first assignment above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Class & Section
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Subject
                   </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {homeworkList.map((homework) => (
                  <tr key={homework._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {homework.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {homework.description}
                      </div>
                    </td>
                                                                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {homework.classId?.name} - {homework.classId?.section}
                      </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                       {homework.subjectId?.name}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(homework.deadline)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(homework._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignHomework;
