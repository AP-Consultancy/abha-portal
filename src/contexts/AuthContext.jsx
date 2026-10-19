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

const readJwtPayload = (token) => {
  const encodedPayload = token?.split(".")[1];
  if (!encodedPayload) {
    return null;
  }
  try {
    const base64Payload = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
    return JSON.parse(atob(base64Payload));
  } catch {
    return null;
  }
};

const isJwtExpired = (token) => {
  const payload = readJwtPayload(token);
  return !payload || !payload.exp || payload.exp * 1000 <= Date.now();
};

const readTokenExpiryMs = (token) => {
  const payload = readJwtPayload(token);
  return payload?.exp ? payload.exp * 1000 : null;
};

const LOGIN_RETRY_DELAYS = [2000, 5000];

const isTransientLoginError = (error) =>
  [502, 503, 504].includes(error?.status) || error?.name === "TypeError";

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

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (window.location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let refreshTimeout;
    let retryTimeout;
    let active = true;
    const refreshMargin = 5 * 60 * 1000;
    const retryDelay = 60 * 1000;

    const scheduleRefresh = () => {
      const token = localStorage.getItem("token");
      const expiryMs = readTokenExpiryMs(token);

      if (!expiryMs) {
        logout();
        return;
      }

      const timeUntilRefresh = expiryMs - Date.now() - refreshMargin;
      if (timeUntilRefresh <= 0) {
        void refreshToken(expiryMs);
        return;
      }

      refreshTimeout = setTimeout(
        () => void refreshToken(expiryMs),
        timeUntilRefresh
      );
    };

    const refreshToken = async (expiryMs) => {
      try {
        const data = await apiService.post(API_ENDPOINTS.REFRESH_TOKEN, {});
        const token = data.token || data.data?.token;
        if (!token) {
          throw new Error("Token refresh response did not include a token");
        }
        if (active) {
          localStorage.setItem("token", token);
          scheduleRefresh();
        }
      } catch (error) {
        if (!active) {
          return;
        }
        if (Date.now() >= expiryMs) {
          logout();
          return;
        }
        retryTimeout = setTimeout(
          () => void refreshToken(expiryMs),
          Math.min(retryDelay, expiryMs - Date.now())
        );
        console.error("Session refresh failed; retrying before token expiry.", error);
      }
    };

    scheduleRefresh();
    return () => {
      active = false;
      clearTimeout(refreshTimeout);
      clearTimeout(retryTimeout);
    };
  }, [user, logout]);

  const login = async (identifier, password, role, onRetry) => {
    if (!identifier || !password || !role) {
      throw new Error("All fields are required");
    }

    let data;
    for (let attempt = 0; ; attempt += 1) {
      try {
        data = await apiService.post(API_ENDPOINTS.LOGIN, {
          identifier,
          password,
          role,
        });
        break;
      } catch (error) {
        if (
          !isTransientLoginError(error) ||
          attempt >= LOGIN_RETRY_DELAYS.length
        ) {
          throw error;
        }
        onRetry?.();
        await new Promise((resolve) =>
          setTimeout(resolve, LOGIN_RETRY_DELAYS[attempt])
        );
      }
    }

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
