import { useAuth } from '../contexts/AuthContext';

// Utility function to check if user can access specific data
export const canAccessData = (userRole, dataOwnerId, currentUserId, requiredRole = null) => {
  // Admin can access everything
  if (userRole === 'admin') {
    return true;
  }

  // If specific role is required, check it
  if (requiredRole && userRole !== requiredRole) {
    return false;
  }

  // Users can always access their own data
  if (dataOwnerId === currentUserId) {
    return true;
  }

  // Teachers can access student data
  if (userRole === 'teacher') {
    return true;
  }

  // Students can only access their own data
  if (userRole === 'student') {
    return false;
  }

  return false;
};

// Hook for role-based data filtering
export const useRoleBasedData = (data, dataOwnerField = 'userId') => {
  const { user, getUserRole } = useAuth();
  
  if (!user || !data) {
    return [];
  }

  const userRole = getUserRole();
  const currentUserId = user.userData?.id || user.id;

  // Filter data based on user role and ownership
  return data.filter(item => {
    const dataOwnerId = item[dataOwnerField];
    return canAccessData(userRole, dataOwnerId, currentUserId);
  });
};

// Hook for checking if user can perform specific actions
export const useCanPerformAction = (action, resourceId = null) => {
  const { user, getUserRole, hasRole } = useAuth();
  
  if (!user) {
    return false;
  }

  const userRole = getUserRole();
  const currentUserId = user.userData?.id || user.id;

  // Define action permissions
  const actionPermissions = {
    // Student actions
    'view_own_profile': userRole === 'student',
    'edit_own_profile': userRole === 'student',
    'view_own_fees': userRole === 'student',
    'pay_fees': userRole === 'student',
    'view_own_exams': userRole === 'student',
    'view_own_attendance': userRole === 'student',
    'view_own_timetable': userRole === 'student',

    // Teacher actions
    'view_students': ['teacher', 'admin'].includes(userRole),
    'edit_students': ['teacher', 'admin'].includes(userRole),
    'view_classes': ['teacher', 'admin'].includes(userRole),
    'edit_classes': userRole === 'admin',
    'view_subjects': ['teacher', 'admin'].includes(userRole),
    'edit_subjects': userRole === 'admin',
    'create_exams': ['teacher', 'admin'].includes(userRole),
    'edit_exams': userRole === 'admin',
    'submit_exam_results': ['teacher', 'admin'].includes(userRole),
    'view_attendance': ['teacher', 'admin'].includes(userRole),
    'edit_attendance': ['teacher', 'admin'].includes(userRole),

    // Admin actions
    'create_students': userRole === 'admin',
    'delete_students': userRole === 'admin',
    'create_teachers': userRole === 'admin',
    'delete_teachers': userRole === 'admin',
    'manage_fees': userRole === 'admin',
    'manage_payments': userRole === 'admin',
    'system_settings': userRole === 'admin',
    'view_reports': userRole === 'admin',
    'manage_accounts': userRole === 'admin',
  };

  const canPerform = actionPermissions[action];
  
  if (typeof canPerform === 'boolean') {
    return canPerform;
  }
  
  if (Array.isArray(canPerform)) {
    return canPerform.includes(userRole);
  }

  return false;
};
