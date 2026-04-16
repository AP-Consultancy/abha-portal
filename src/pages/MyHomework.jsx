import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { homeworkService } from '../services/homeworkService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const MyHomework = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [homeworkList, setHomeworkList] = useState([]);
  const [filteredHomework, setFilteredHomework] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');

  const [sortBy, setSortBy] = useState('deadline');

  useEffect(() => {
    console.log('MyHomework useEffect - user data:', {
      user: user,
      classId: user.classId,
      class: user.class,
      userData: user.userData
    });
    fetchHomework();
  }, []);

  useEffect(() => {
    filterAndSortHomework();
  }, [homeworkList, selectedSubject, sortBy]);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      console.log('Fetching homework for student with classId:', user.classId || user.class);
      // For students, we need to get their class ID first
      // Students have className and section, not classId
      const studentClass = user.userData?.className;
      const studentSection = user.userData?.section;
      
      if (!studentClass || !studentSection) {
        throw new Error('Student class information not found. Please contact an administrator.');
      }
      
      console.log('Student class info:', { className: studentClass, section: studentSection });
      
      // Use the new endpoint to get homework for the student's class
      const response = await homeworkService.getHomeworkForStudent(studentClass, studentSection);
      console.log('Student homework response:', response);
      // Handle different response structures
      let homeworkArray = [];
      if (response && Array.isArray(response)) {
        // Direct array response
        homeworkArray = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Wrapped in data property
        homeworkArray = response.data;
      } else if (response && response.homework && Array.isArray(response.homework)) {
        // Wrapped in homework property
        homeworkArray = response.homework;
      } else {
        console.warn('Unexpected homework response structure:', response);
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

    // For students, the backend already returns homework for their class
    // Just filter by subject if selected
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(hw => hw.subjectId?._id === selectedSubject);
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
        default:
          return 0;
      }
    });

    setFilteredHomework(filtered);
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



  const getUniqueSubjects = () => {
    // For students, the backend already returns homework for their class
    const subjects = [...new Set(homeworkList.map(hw => hw.subjectId?._id))];
    return subjects.filter(Boolean);
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

  if (loading && !homeworkList.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Homework
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and track your homework assignments
        </p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Filters and Sorting */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Students filter by subject */}
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

           

          {/* Sort By */}
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
            </select>
          </div>
        </div>
      </div>

      {/* Homework List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Homework Assignments ({filteredHomework.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : filteredHomework.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {homeworkList.length === 0 
              ? 'No homework assignments found for your class.'
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {homework.teacherId?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(homework.deadline)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(homework.deadline)}
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

export default MyHomework;
