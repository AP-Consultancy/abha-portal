import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
    roles: ["student"],
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
    name: "Attendance Management",
    href: "/attendance",
    icon: ClockIcon,
    roles: ["admin", "teacher"],
  },
  {
    name: "My Attendance",
    href: "/my-attendance",
    icon: ClockIcon,
    roles: ["student"],
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

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  // Filter allowed navigation items based on role
  const navigation = allNavigation.filter((item) =>
    item.roles.includes(userRole)
  );
  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-white" />
            <span className="ml-2 text-lg font-semibold text-white">
              EduPortal
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-4 border-blue-600"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
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
