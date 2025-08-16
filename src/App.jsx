import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import ErrorBoundary from "./components/common/ErrorBoundary";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Students from "./pages/Students";
import Employees from "./pages/Employees";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Fees from "./pages/Fees";
import Attendance from "./pages/Attendance";
import StudentAttendance from "./pages/StudentAttendance";
import Timetable from "./pages/Timetable";
import Exams from "./pages/Exams";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Accounts from "./pages/Accounts";
import CreateStudent from "./pages/AddStudent";
import TeacherRegistrationForm from "./pages/AddTeacher";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import RoleAwareStudents from "./components/RoleAwareStudents";
import RoleAwareClasses from "./components/RoleAwareClasses";
import RoleAwareSubjects from "./components/RoleAwareSubjects";
import RoleAwareFees from "./components/RoleAwareFees";
import RoleAwareAttendance from "./components/RoleAwareAttendance";
import RoleAwareTimetable from "./components/RoleAwareTimetable";
import RoleAwareExams from "./components/RoleAwareExams";
import RoleAwareDashboard from "./components/RoleAwareDashboard";
import StudentProfile from "./components/StudentProfile";
import RoleAwareProfile from "./components/RoleAwareProfile";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<RoleBasedRedirect />} />

                  {/* Protected Routes */}
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            {/* Dashboard - Role-aware */}
                            <Route
                              path="/dashboard"
                              element={<RoleAwareDashboard />}
                            />

                            {/* Students - Admin can manage all, others see their profile only */}
                            <Route
                              path="/students"
                              element={<RoleAwareStudents />}
                            />

                            {/* Profile - Redirects to appropriate profile based on role */}
                            <Route
                              path="/profile"
                              element={<RoleAwareProfile />}
                            />

                            {/* Employees - Admin only */}
                            <Route
                              path="/employees"
                              element={
                                <ProtectedRoute requiredRoles={["admin"]}>
                                  <Employees />
                                </ProtectedRoute>
                              }
                            />

                            {/* Classes - Admin can manage; teachers view their classes */}
                            <Route
                              path="/classes"
                              element={
                                <ProtectedRoute requiredRoles={["admin", "teacher", "employee"]}>
                                  <RoleAwareClasses />
                                </ProtectedRoute>
                              }
                            />

                            {/* Subjects - Admin can manage, others view only */}
                            <Route
                              path="/subjects"
                              element={<RoleAwareSubjects />}
                            />

                            {/* Fees - Admin can manage, students can view/pay their fees */}
                            <Route path="/fees" element={<RoleAwareFees />} />

                            {/* Attendance - Admin can manage, others view their own */}
                            <Route
                              path="/attendance"
                              element={<RoleAwareAttendance />}
                            />

                            {/* Teacher Routes */}
                            <Route
                              path="/attendance"
                              element={
                                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                                  <Attendance />
                                </ProtectedRoute>
                              }
                            />

                            {/* Student Routes */}
                            <Route
                              path="/my-attendance"
                              element={
                                <ProtectedRoute allowedRoles={["student"]}>
                                  <StudentAttendance />
                                </ProtectedRoute>
                              }
                            />

                            {/* Timetable - Admin can manage, others view their own */}
                            <Route
                              path="/timetable"
                              element={<RoleAwareTimetable />}
                            />

                            {/* Exams - Admin can manage, others view their own */}
                            <Route path="/exams" element={<RoleAwareExams />} />

                            {/* Reports - Admin only */}
                            <Route
                              path="/reports"
                              element={
                                <ProtectedRoute requiredRoles={["admin"]}>
                                  <Reports />
                                </ProtectedRoute>
                              }
                            />

                            {/* Accounts - Admin only */}
                            <Route
                              path="/accounts"
                              element={
                                <ProtectedRoute requiredRoles={["admin"]}>
                                  <Accounts />
                                </ProtectedRoute>
                              }
                            />

                            {/* Settings - Admin only */}
                            <Route
                              path="/settings"
                              element={
                                <ProtectedRoute requiredRoles={["admin"]}>
                                  <Settings />
                                </ProtectedRoute>
                              }
                            />

                            {/* Add Student - Admin only */}
                            <Route
                              path="/add-student"
                              element={
                                <ProtectedRoute requiredRoles={["admin"]}>
                                  <CreateStudent />
                                </ProtectedRoute>
                              }
                            />

                            {/* Add Teacher - Admin only */}
                            <Route
                              path="/add-teacher"
                              element={
                                <ProtectedRoute requiredRoles={["admin"]}>
                                  <TeacherRegistrationForm />
                                </ProtectedRoute>
                              }
                            />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>

                {/* Toast Notifications */}
                {/* <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                /> */}
              </div>
            </Router>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
