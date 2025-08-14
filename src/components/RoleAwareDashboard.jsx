import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Dashboard from "../pages/Dashboard";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";

const RoleAwareDashboard = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  switch (userRole) {
    case "admin":
      return <Dashboard />;
    case "teacher":
    case "employee":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    default:
      return <div>Access denied</div>;
  }
};

export default RoleAwareDashboard;
