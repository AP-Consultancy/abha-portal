import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
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
        email: identifier,
        password,
      });

      if (data.success) {
        const authData = data.data || data;
        // Store token separately for security
        if (authData.token) {
          localStorage.setItem("token", authData.token);
        }
        
        // Normalize the user data structure
        const baseUserData =
          authData.user || data.student || data.teacher || data.admin || null;
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
          ...authData,
          userRole: resolvedRole,
          userData: mappedUserData,
        };
        
        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    window.location.href = "/login";
  };

  const getUserRole = () => {
    if (!user) return null;
    // Check for explicit userRole first, then check nested user objects
    const role = user.userRole || (user.student?.user || user.teacher?.user || user.admin?.user || '').toLowerCase();
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
