import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import { API_ENDPOINTS } from "../utils/constants";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const isJwtExpired = (token) => {
  if (!token || token.split(".").length < 2) {
    return true;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) {
      return false;
    }
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedUser && token && !isJwtExpired(token)) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.userRole) {
          parsed.userRole = String(parsed.userRole).toLowerCase();
        }
        if (parsed?.userData?.role) {
          parsed.userData.role = String(parsed.userData.role).toLowerCase();
        }
        setUser(parsed);
      } catch (_err) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password, role) => {
    if (!identifier || !password || !role) {
      throw new Error("All fields are required");
    }

    const data = await apiService.post(API_ENDPOINTS.LOGIN, {
      identifier,
      enrollmentNo: identifier,
      email: identifier.includes("@") ? identifier : undefined,
      password,
      role,
    });

    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }

    const authData = data.data || data;
    const token = data.token || authData.token;

    if (token) {
      localStorage.setItem("token", token);
    }

    const baseUserData =
      data.student ||
      data.teacher ||
      data.admin ||
      authData.user ||
      null;
    const resolvedRole = (baseUserData?.role || role || "").toLowerCase();
    const mappedUserData = baseUserData
      ? {
          ...baseUserData,
          _id: baseUserData._id || baseUserData.id,
          firstName: baseUserData.firstName || baseUserData.first_name,
          lastName: baseUserData.lastName || baseUserData.last_name,
          studentId: baseUserData.studentId || baseUserData.student_id || null,
          teacherId: baseUserData.teacherId || baseUserData.teacher_id || null,
          role: resolvedRole,
        }
      : null;
    const normalizedUser = {
      ...data,
      userRole: resolvedRole,
      userData: mappedUserData,
    };

    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    return true;
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (window.location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const getUserRole = () => {
    if (!user) return null;
    const role =
      user.userRole ||
      user.userData?.role ||
      user.student?.user ||
      user.teacher?.user ||
      user.admin?.user ||
      "";
    return String(role).toLowerCase() || null;
  };

  const getStudentId = () =>
    user?.userData?.studentId ||
    user?.userData?.student_id ||
    user?.student?.studentId ||
    user?.student?.student_id ||
    null;

  const getTeacherId = () =>
    user?.userData?.teacherId ||
    user?.userData?.teacher_id ||
    user?.teacher?.teacherId ||
    user?.teacher?.teacher_id ||
    null;

  const hasRole = (requiredRoles) => {
    const currentRole = getUserRole();
    if (!currentRole) return false;

    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(currentRole);
    }
    return requiredRoles === currentRole;
  };

  const value = {
    user,
    login,
    logout,
    loading,
    getUserRole,
    getStudentId,
    getTeacherId,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
