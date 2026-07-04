import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { XMarkIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  CalculatorIcon,
  ClipboardDocumentListIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";

const allNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["admin", "student", "employee", "teacher"],
  },
  {
    name: "My Profile",
    href: "/profile",
    icon: UsersIcon,
    roles: ["student", "employee", "teacher"],
  },
  {
    name: "Students",
    href: "/students",
    icon: UsersIcon,
    roles: ["admin"],
  },
  {
    name: "Employees",
    href: "/employees",
    icon: UserGroupIcon,
    roles: ["admin"],
  },
  {
    name: "Classes",
    href: "/classes",
    icon: AcademicCapIcon,
    roles: ["admin"],
  },
  {
    name: "My Classes",
    href: "/classes",
    icon: AcademicCapIcon,
    roles: ["teacher", "employee"],
  },
  {
    name: "Subjects",
    href: "/subjects",
    icon: BookOpenIcon,
    roles: ["admin"],
  },
  {
    name: "My Subjects",
    href: "/subjects",
    icon: BookOpenIcon,
    roles: ["student", "teacher", "employee"],
  },
  {
    name: "Fees Management",
    href: "/fees",
    icon: CurrencyDollarIcon,
    roles: ["admin"],
  },
  {
    name: "My Fees",
    href: "/fees",
    icon: CurrencyDollarIcon,
    roles: ["student"],
  },
  {
    name: "Salary Management",
    href: "/salary-management",
    icon: CurrencyDollarIcon,
    roles: ["admin"],
  },
  {
    name: "My Salary",
    href: "/my-salary",
    icon: CurrencyDollarIcon,
    roles: ["teacher", "employee"],
  },
  {
    name: "Attendance Management",
    icon: ClockIcon,
    roles: ["admin", "teacher", "employee"],
    children: [
      {
        name: "Student Attendance",
        href: "/attendance",
        roles: ["admin", "teacher", "employee"],
      },
      {
        name: "Employee Attendance",
        href: "/teacher-attendance",
        roles: ["admin"],
      },
    ],
  },
  {
    name: "My Attendance",
    href: "/my-attendance",
    icon: ClockIcon,
    roles: ["student"],
  },
  {
    name: "My Attendance",
    href: "/my-teacher-attendance",
    icon: ClockIcon,
    roles: ["teacher", "employee"],
  },
  {
    name: "My Homework",
    href: "/homework",
    icon: DocumentTextIcon,
    roles: ["student"],
  },
  {
    name: "Assign Homework",
    href: "/homework",
    icon: DocumentTextIcon,
    roles: ["teacher", "employee"],
  },
  {
    name: "Homework Management",
    href: "/homework",
    icon: DocumentTextIcon,
    roles: ["admin"],
  },
  {
    name: "Timetable",
    href: "/timetable",
    icon: CalendarIcon,
    roles: ["admin"],
  },
  {
    name: "My Timetable",
    href: "/timetable",
    icon: CalendarIcon,
    roles: ["student", "employee", "teacher"],
  },
  {
    name: "Exams Management",
    href: "/exams",
    icon: DocumentTextIcon,
    roles: ["admin"],
  },
  {
    name: "My Exams",
    href: "/exams",
    icon: DocumentTextIcon,
    roles: ["student", "employee", "teacher"],
  },
  {
    name: "Performance & Behavior",
    href: "/performance",
    icon: PresentationChartLineIcon,
    roles: ["admin", "teacher", "employee", "student"],
  },
  {
    name: "Rules & Regulations",
    href: "/rules",
    icon: ClipboardDocumentListIcon,
    roles: ["admin", "teacher", "employee", "student"],
  },
  {
    name: "Bonafide",
    href: "/bonafide",
    icon: DocumentTextIcon,
    roles: ["admin", "teacher", "employee"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: ChartBarIcon,
    roles: ["admin"],
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: CalculatorIcon,
    roles: ["admin"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: CogIcon,
    roles: ["admin"],
  },
];

const filterNavItems = (items, userRole) =>
  items
    .map((item) => {
      if (item.children) {
        const children = item.children.filter((child) =>
          child.roles.includes(userRole)
        );
        if (!item.roles.includes(userRole) && children.length === 0) {
          return null;
        }
        if (children.length === 0) return null;
        return { ...item, children };
      }
      return item.roles.includes(userRole) ? item : null;
    })
    .filter(Boolean);

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const navigation = filterNavItems(allNavigation, userRole);

  const attendancePaths = ["/attendance", "/teacher-attendance"];
  const [attendanceOpen, setAttendanceOpen] = useState(
    attendancePaths.some((path) => location.pathname.startsWith(path))
  );

  const linkClasses = (isActive) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-4 border-blue-600"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  const childLinkClasses = (isActive) =>
    `flex items-center pl-11 pr-4 py-2.5 text-sm rounded-lg transition-colors ${
      isActive
        ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-full max-h-screen w-64 flex-col bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:static lg:inset-0 lg:max-h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between bg-blue-600 px-6">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-white" />
            <span className="ml-2 text-lg font-semibold text-white">EduPortal</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-4">
          <div className="space-y-2 px-4 pb-6">
            {navigation.map((item) => {
              if (item.children) {
                const groupActive = item.children.some(
                  (child) => location.pathname === child.href
                );
                const showSingleChild =
                  item.children.length === 1 && userRole !== "admin";

                if (showSingleChild) {
                  const child = item.children[0];
                  return (
                    <Link
                      key={item.name}
                      to={child.href}
                      className={linkClasses(location.pathname === child.href)}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                }

                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      onClick={() => setAttendanceOpen((open) => !open)}
                      className={`w-full ${linkClasses(groupActive)}`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {attendanceOpen ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                    {attendanceOpen && (
                      <div className="mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={childLinkClasses(
                              location.pathname === child.href
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={`${item.name}-${item.href}`}
                  to={item.href}
                  className={linkClasses(isActive)}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
