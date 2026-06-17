import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Attendance from "../pages/Attendance";
import StudentAttendance from "../pages/StudentAttendance";

const RoleAwareAttendance = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  if (userRole === "admin" || userRole === "teacher" || userRole === "employee") {
    return <Attendance />;
  }

  if (userRole === "student") {
    return <Navigate to="/my-attendance" replace />;
  }

  return <StudentAttendance />;
};

export default RoleAwareAttendance;
