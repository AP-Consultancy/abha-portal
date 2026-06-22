import React, { createContext, useContext, useState, useEffect } from "react";
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

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password, role) => {
    setLoading(true);
    if (!identifier || !password || !role) {
      setLoading(false);
      throw new Error("All fields are required");
    }

    try {
      const data = await apiService.post(API_ENDPOINTS.LOGIN, {
        identifier,
        enrollmentNo: identifier,
        email: identifier.includes("@") ? identifier : undefined,
        password,
        role,
      });

      if (data.success) {
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
            }
          : null;
        const normalizedUser = {
          ...data,
          userRole: resolvedRole,
          userData: mappedUserData,
        };

        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        setLoading(false);
        return true;
      }

      setLoading(false);
      throw new Error(data.message || "Login failed");
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const getUserRole = () => {
    if (!user) return null;
    const role =
      user.userRole ||
      (user.student?.user || user.teacher?.user || user.admin?.user || "").toLowerCase();
    return role;
  };

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
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
