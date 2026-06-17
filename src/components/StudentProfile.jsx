import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { studentService } from '../services/studentService';
import { feeService } from '../services/feeService';
import StudentFeesPanel from './students/StudentFeesPanel';
import { formatDate } from '../utils/studentUtils';
import {
  UserIcon,
  AcademicCapIcon,
  PhoneIcon,
  CalendarIcon,
  IdentificationIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

const show = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return String(value);
};

const StudentProfile = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const [profile, fees] = await Promise.all([
          studentService.getStudentProfile(),
          feeService.getMyFees().catch(() => null),
        ]);
        if (!cancelled) {
          setStudent(profile);
          setFeeData(fees);
        }
      } catch (err) {
        console.error('Error loading student profile:', err);
        if (!cancelled) {
          setError(err.message || 'Failed to load profile');
          // Minimal fallback from login session only
          if (user?.userData) {
            setStudent({
              firstName: user.userData.firstName || user.userData.first_name || '',
              lastName: user.userData.lastName || user.userData.last_name || '',
              email: user.userData.email || '',
            });
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (user) loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayName =
    `${student?.firstName || ''} ${student?.lastName || ''}`.trim() ||
    student?.studentName ||
    'Student';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-center">
            <div className="bg-white rounded-full p-3">
              <UserIcon className="h-12 w-12 text-blue-600" />
            </div>
            <div className="ml-6 text-white">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-blue-100">Student Profile</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </h2>
              <div className="space-y-3">
                <Field label="Student ID" value={show(student?.studentId || student?.id)} />
                <Field label="Scholar Number" value={show(student?.scholarNumber)} />
                <Field label="Admission No" value={show(student?.admissionNo || student?.enrollmentNo)} />
                <Field label="Gender" value={show(student?.gender)} />
                <Field label="Date of Birth" value={student?.dob ? formatDate(student.dob) : 'N/A'} />
                <Field label="Aadhaar No" value={show(student?.aadhaarNo)} />
                <Field label="SSSMID" value={show(student?.sssmid)} />
                <Field label="PAN No" value={show(student?.panNo)} />
                <Field label="APAAR ID" value={show(student?.apaarId)} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-600" />
                Academic Information
              </h2>
              <div className="space-y-3">
                <Field label="Class" value={show(student?.className)} />
                <Field label="Section" value={show(student?.section)} />
                <Field label="Roll Number" value={show(student?.rollNo)} />
                <Field label="Academic Year" value={show(student?.academicYear)} />
                <Field
                  label="Admission Date"
                  value={student?.admissionDate ? formatDate(student.admissionDate) : 'N/A'}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </h2>
              <div className="space-y-3">
                <Field label="Phone" value={show(student?.phone)} />
                <Field label="Alternate Contact" value={show(student?.alternateContactNo)} />
                <Field label="Email" value={show(student?.email)} />
                <Field
                  label="Address"
                  value={
                    student?.address?.street ||
                    student?.address?.city ||
                    student?.address?.state
                      ? `${show(student?.address?.street)}, ${show(student?.address?.city)}, ${show(student?.address?.state)} ${show(student?.address?.postalCode)}`
                      : 'N/A'
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Parent Information
              </h2>
              <div className="space-y-3">
                <Field label="Father's Name" value={show(student?.father?.name)} />
                <Field label="Father's Phone" value={show(student?.father?.phone)} />
                <Field label="Mother's Name" value={show(student?.mother?.name)} />
                <Field label="Mother's Phone" value={show(student?.mother?.phone)} />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2 text-blue-600" />
                Fee Summary
              </h2>
              <StudentFeesPanel feeData={feeData} variant="profile" />
            </div>

            <div className="space-y-4 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Attendance Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Present Days" value={show(student?.totalPresent)} />
                <Field label="Absent Days" value={show(student?.totalAbsent)} />
                <Field label="Attendance %" value={show(student?.attendancePercentage)} />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickLink href="/attendance" icon={CalendarIcon} label="My Attendance" color="blue" />
              <QuickLink href="/fees" icon={BanknotesIcon} label="Fee Details" color="green" />
              <QuickLink href="/timetable" icon={CalendarIcon} label="Timetable" color="purple" />
              <QuickLink href="/exams" icon={IdentificationIcon} label="Exams" color="yellow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value }) => (
  <div>
    <label className="text-sm text-gray-500">{label}</label>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);

const QuickLink = ({ href, icon: Icon, label, color }) => {
  const colors = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-900',
    green: 'bg-green-50 hover:bg-green-100 text-green-900',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-900',
    yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-900',
  };
  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
  };

  return (
    <a
      href={href}
      className={`flex flex-col items-center p-4 rounded-lg transition-colors ${colors[color]}`}
    >
      <Icon className={`h-8 w-8 mb-2 ${iconColors[color]}`} />
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
};

export default StudentProfile;
