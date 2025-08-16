import React, { createContext, useContext, useState, useEffect } from "react";

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
      throw new Error("All fields are required");
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          role === "student"
            ? { identifier, password, role }
            : { enrollmentNo: identifier, password, role }
        ),
      });
      
      const data = await response.json();
      console.log(data, "data from login");
      
      if (response.ok) {
        // Store token separately for security
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        // Normalize the user data structure
        const baseUserData = data.student || data.teacher || data.admin || null;
        const mappedUserData = baseUserData
          ? { ...baseUserData, _id: baseUserData._id || baseUserData.id }
          : null;
        const normalizedUser = {
          ...data,
          userRole: role.toLowerCase(),
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
