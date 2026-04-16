import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { homeworkService } from '../services/homeworkService';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';

const RoleAwareHomework = () => {
  const { user, getUserRole } = useAuth();
  const userRole = getUserRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [homeworkList, setHomeworkList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [classesLoaded, setClassesLoaded] = useState(false);
  
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

  useEffect(() => {
    filterAndSortHomework();
  }, [homeworkList, selectedClass, selectedSubject, sortBy, userRole]);

  // Debug effect to monitor classes and subjects state changes
  useEffect(() => {
    console.log('Classes state changed:', classes);
    console.log('Subjects state changed:', subjects);
    console.log('ClassesLoaded state changed:', classesLoaded);
  }, [classes, subjects, classesLoaded]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      let homeworkData;
      
      if (userRole === 'admin') {
        console.log('Fetching homework as admin...');
        homeworkData = await homeworkService.getAllHomework();
        console.log('Admin homework response:', homeworkData);
      } else if (userRole === 'teacher' || userRole === 'employee') {
        const teacherId = user.userData?._id || user.id;
        console.log('Fetching homework as teacher/employee with ID:', teacherId);
        homeworkData = await homeworkService.getHomeworkByTeacher(teacherId);
        console.log('Teacher homework response:', homeworkData);
      } else if (userRole === 'student') {
        const studentId = user.userData?._id || user.id;
        const studentClass = user.userData?.className;
        const studentSection = user.userData?.section;
        
        console.log('Fetching homework as student with ID:', studentId, 'Class:', studentClass, 'Section:', studentSection);
        
        if (studentClass && studentSection) {
          // Use the new endpoint to get homework for the student's class
          homeworkData = await homeworkService.getHomeworkForStudent(studentClass, studentSection);
        } else {
          // Fallback to getting all homework if class info is missing
          homeworkData = await homeworkService.getAllHomework();
        }
        
        console.log('Student homework response:', homeworkData);
      }
      


      // Don't fetch classes and subjects here - we'll fetch them when needed
      setClasses([]);
      setSubjects([]);
      setClassesLoaded(false);
      
      // Handle different response structures
      let homeworkArray = [];
      if (homeworkData && Array.isArray(homeworkData)) {
        // Direct array response
        homeworkArray = homeworkData;
      } else if (homeworkData && homeworkData.data && Array.isArray(homeworkData.data)) {
        // Wrapped in data property
        homeworkArray = homeworkData.data;
      } else if (homeworkData && homeworkData.homework && Array.isArray(homeworkData.homework)) {
        // Wrapped in homework property
        homeworkArray = homeworkData.homework;
      } else {
        console.warn('Unexpected homework data structure:', homeworkData);
        homeworkArray = [];
      }
      
      console.log('Setting homework list with:', homeworkArray.length, 'records');
      setHomeworkList(homeworkArray);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortHomework = () => {
    let filtered = [...homeworkList];

    // Role-based filtering
    if (userRole === 'teacher' || userRole === 'employee') {
      // Teachers filter by class
      if (selectedClass !== 'all') {
        filtered = filtered.filter(hw => hw.classId?._id === selectedClass);
      }
    } else if (userRole === 'student') {
      // For students, the backend already returns homework for their class
      // Just filter by subject if selected
      if (selectedSubject !== 'all') {
        filtered = filtered.filter(hw => hw.subjectId?._id === selectedSubject);
      }
    } else if (userRole === 'admin') {
      // Admins can filter by both
      if (selectedClass !== 'all') {
        filtered = filtered.filter(hw => hw.classId?._id === selectedClass);
      }
      if (selectedSubject !== 'all') {
        filtered = filtered.filter(hw => hw.subjectId?._id === selectedSubject);
      }
    }

    // Sort homework
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'subject':
          return a.subjectId?.name?.localeCompare(b.subjectId?.name) || 0;
        case 'teacher':
          return a.teacherId?.name?.localeCompare(b.teacherId?.name) || 0;
        default:
          return 0;
      }
    });

    return filtered;
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

      await homeworkService.createHomework(homeworkData);
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
      await fetchInitialData();
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
        await fetchInitialData();
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

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const getStatusBadge = (deadline) => {
    if (isOverdue(deadline)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Overdue
        </span>
      );
    }
    
    const daysUntilDeadline = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline <= 1) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Due Soon
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Active
      </span>
    );
  };

  const getUniqueClasses = () => {
    const classes = [...new Set(homeworkList.map(hw => hw.classId?._id))];
    return classes.filter(Boolean);
  };

  const getUniqueSubjects = () => {
    // For students, the backend already returns homework for their class
    // For other roles, show all subjects
    const subjects = [...new Set(homeworkList.map(hw => hw.subjectId?._id))];
    return subjects.filter(Boolean);
  };

  const canAssignHomework = userRole === 'admin' || userRole === 'teacher' || userRole === 'employee';
  
  const loadClassesAndSubjects = async () => {
    if (classesLoaded) return;
    
    try {
      setLoading(true);
      let classesData, subjectsData;
      
      console.log('Loading classes and subjects for role:', userRole);
      console.log('User ID:', user.userData?._id || user.id);
      
      // Use role-appropriate methods
      if (userRole === 'admin') {
        console.log('Fetching as admin...');
        [classesData, subjectsData] = await Promise.all([
          classService.getAllClasses(),
          subjectService.getAllSubjects()
        ]);
      } else if (userRole === 'teacher' || userRole === 'employee') {
        const teacherId = user.userData?._id || user.id;
        console.log('Fetching as teacher/employee with ID:', teacherId);
        [classesData, subjectsData] = await Promise.all([
          classService.getTeacherClasses(teacherId),
          subjectService.getSubjectsByTeacher(teacherId)
        ]);
      }
      
      console.log('Classes response:', classesData);
      console.log('Subjects response:', subjectsData);
      
      // Check if the response has the expected structure
      // Handle different response formats: {data: [...]} or {classes: [...], subjects: [...]}
      // The backend returns: {success: true, classes: [...], subjects: [...]}
      const classesArray = classesData?.classes || classesData?.data || classesData || [];
      const subjectsArray = subjectsData?.subjects || subjectsData?.data || subjectsData || [];
      
      console.log('Processed classes:', classesArray);
      console.log('Processed subjects:', subjectsArray);
      
      // Ensure we're always setting arrays
      const finalClasses = Array.isArray(classesArray) ? classesArray : [];
      const finalSubjects = Array.isArray(subjectsArray) ? subjectsArray : [];
      
             console.log('Final classes to set:', finalClasses);
       console.log('Final subjects to set:', finalSubjects);
       console.log('Classes isArray:', Array.isArray(finalClasses));
       console.log('Subjects isArray:', Array.isArray(finalSubjects));
       
       // Debug: Log first few classes to see their structure
       if (finalClasses.length > 0) {
         console.log('First class structure:', finalClasses[0]);
         console.log('First class name:', finalClasses[0]?.name);
         console.log('First class _id:', finalClasses[0]?._id);
       }
      
      setClasses(finalClasses);
      setSubjects(finalSubjects);
      setClassesLoaded(true);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error loading classes and subjects:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      // Try alternative approach - extract from existing homework data
      console.log('Trying alternative approach - extracting from homework data...');
      const alternativeClasses = [...new Set(homeworkList.map(hw => hw.classId))].filter(Boolean);
      const alternativeSubjects = [...new Set(homeworkList.map(hw => hw.subjectId))].filter(Boolean);
      
      if (alternativeClasses.length > 0 || alternativeSubjects.length > 0) {
        console.log('Found alternative data:', { alternativeClasses, alternativeSubjects });
        // Ensure we're setting arrays
        setClasses(Array.isArray(alternativeClasses) ? alternativeClasses : []);
        setSubjects(Array.isArray(alternativeSubjects) ? alternativeSubjects : []);
        setClassesLoaded(true);
        setError('Using limited data from existing homework. Some features may be restricted.');
      } else {
        let errorMessage = 'Unable to load class and subject data. ';
        if (err.response?.status === 403) {
          errorMessage += 'Access denied. Please contact an administrator.';
        } else if (err.response?.status === 404) {
          errorMessage += 'Service not found. Please contact an administrator.';
        } else if (err.response?.status >= 500) {
          errorMessage += 'Server error. Please try again later.';
        } else {
          errorMessage += 'Please try again later.';
        }
        
        setError(errorMessage);
        setClasses([]);
        setSubjects([]);
        setClassesLoaded(false);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const filteredHomework = filterAndSortHomework();

  if (loading && !homeworkList.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {userRole === 'admin' ? 'Homework Management' : 
           userRole === 'student' ? 'My Homework' : 'Assign Homework'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {userRole === 'admin' ? 'Manage all homework assignments across the school' :
           userRole === 'student' ? 'View and track your homework assignments' :
           'Create and manage homework assignments for your classes'}
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

      {canAssignHomework && (
        <div className="mb-6">
          <button
            onClick={() => {
              if (!showForm && !classesLoaded) {
                loadClassesAndSubjects();
              }
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : 'Assign New Homework'}
          </button>
        </div>
      )}

      {showForm && canAssignHomework && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          {!classesLoaded ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading class and subject data...</p>
            </div>
                     ) : (() => {
             console.log('Form rendering condition check:');
             console.log('- classesLoaded:', classesLoaded);
             console.log('- classes isArray:', Array.isArray(classes));
             console.log('- subjects isArray:', Array.isArray(subjects));
             console.log('- classes length:', classes.length);
             console.log('- subjects length:', subjects.length);
             
             return !Array.isArray(classes) || !Array.isArray(subjects) || classes.length === 0 || subjects.length === 0;
           })() ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">
                Unable to load class or subject data. Please contact an administrator.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Debug Info:</p>
                <p>Classes loaded: {classes.length}</p>
                <p>Subjects loaded: {subjects.length}</p>
                <p>User Role: {userRole}</p>
                <p>User ID: {user.userData?._id || user.id}</p>
              </div>
              <button
                onClick={() => {
                  setClassesLoaded(false);
                  loadClassesAndSubjects();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry Loading
              </button>
            </div>
          ) : (
            <>
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
                  Subject *
                </label>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                                     <option value="">Select Subject</option>
                   {Array.isArray(subjects) && subjects.map((subject) => (
                     <option key={subject._id} value={subject._id}>
                       {subject.name}
                     </option>
                   ))}
                </select>
              </div>
              
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
            </>
          )}
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role-based filters */}
          {userRole === 'teacher' || userRole === 'employee' ? (
            // Teachers filter by class
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Classes</option>
                {getUniqueClasses().map((classId) => {
                  const cls = homeworkList.find(hw => hw.classId?._id === classId)?.classId;
                  return (
                    <option key={classId} value={classId}>
                      Class {cls?.name} - Section {cls?.section}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : userRole === 'student' ? (
            // Students filter by subject
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Subjects</option>
                {getUniqueSubjects().map((subjectId) => {
                  const subject = homeworkList.find(hw => hw.subjectId?._id === subjectId)?.subjectId;
                  return (
                    <option key={subjectId} value={subjectId}>
                      {subject?.name}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            // Admins get both filters
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Classes</option>
                  {getUniqueClasses().map((classId) => {
                    const cls = homeworkList.find(hw => hw.classId?._id === classId)?.classId;
                    return (
                      <option key={classId} value={classId}>
                        Class {cls?.name} - Section {cls?.section}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Subjects</option>
                  {getUniqueSubjects().map((subjectId) => {
                    const subject = homeworkList.find(hw => hw.subjectId?._id === subjectId)?.subjectId;
                    return (
                      <option key={subjectId} value={subjectId}>
                        {subject?.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </>
          )}

          {/* Sort By - available for all roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="deadline">Deadline</option>
              <option value="title">Title</option>
              <option value="subject">Subject</option>
              {userRole === 'admin' && <option value="teacher">Teacher</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Homework List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {userRole === 'admin' ? 'All Homework Assignments' :
             userRole === 'student' ? 'My Homework Assignments' :
             'My Homework Assignments'} ({filteredHomework.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : filteredHomework.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {homeworkList.length === 0 
              ? 'No homework assignments found.'
              : 'No homework assignments match the selected filters.'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Assignment
                  </th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Class & Section
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Subject
                   </th>
                  {userRole === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Teacher
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  {canAssignHomework && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredHomework.map((homework) => (
                  <tr key={homework._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {homework.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        {homework.description}
                      </div>
                    </td>
                                                                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {homework.classId?.name} - {homework.classId?.section}
                      </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                       {homework.subjectId?.name}
                     </td>
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {homework.teacherId?.name}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(homework.deadline)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(homework.deadline)}
                    </td>
                    {canAssignHomework && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(homework._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    )}
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

export default RoleAwareHomework;
