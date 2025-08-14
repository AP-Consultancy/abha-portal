import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { UsersIcon, UserGroupIcon, CurrencyDollarIcon, ClockIcon, AcademicCapIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Unauthorized. Please log in as admin.');
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          setError('Session expired or unauthorized. Please log in again as admin.');
          setLoading(false);
          return;
        }
        if (res.status === 403) {
          setError('Forbidden. Admin access required.');
          setLoading(false);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to load dashboard');
        }
        const data = await res.json();
        setSummary(data);
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const s = summary?.stats;
    if (!s) return [];
    const attendancePct = (() => {
      const total = (s.attendanceToday?.present || 0) + (s.attendanceToday?.absent || 0) + (s.attendanceToday?.late || 0);
      return total > 0 ? `${Math.round(((s.attendanceToday.present || 0) / total) * 100)}%` : '0%';
    })();
    return [
      { name: 'Total Students', value: String(s.totalStudents || 0), icon: UsersIcon, color: 'bg-blue-500', change: '' },
      { name: 'Total Staff', value: String(s.totalStaff || 0), icon: UserGroupIcon, color: 'bg-green-500', change: '' },
      { name: 'Revenue (paid)', value: `₹${(s.revenue || 0).toLocaleString('en-IN')}`, icon: CurrencyDollarIcon, color: 'bg-yellow-500', change: '' },
      { name: "Today's Attendance", value: attendancePct, icon: ClockIcon, color: 'bg-purple-500', change: '' },
      { name: 'Classes', value: String(s.totalClasses || 0), icon: AcademicCapIcon, color: 'bg-pink-500', change: '' },
      { name: 'Pending Fees', value: `₹${((summary?.stats?.pendingFees) || 0).toLocaleString('en-IN')}`, icon: ArrowTrendingUpIcon, color: 'bg-indigo-500', change: '' },
    ];
  }, [summary]);

  const barData = useMemo(() => ({
    labels: summary?.charts?.bar?.labels || [],
    datasets: [
      {
        label: 'Students',
        data: summary?.charts?.bar?.students || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Staff',
        data: summary?.charts?.bar?.staff || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      }
    ]
  }), [summary]);

  const doughnutData = useMemo(() => ({
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [
          summary?.charts?.doughnut?.present || 0,
          summary?.charts?.doughnut?.absent || 0,
          summary?.charts?.doughnut?.late || 0,
        ],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        borderWidth: 2,
      }
    ]
  }), [summary]);

  const lineData = useMemo(() => ({
    labels: summary?.charts?.line?.weeks || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Attendance %',
        data: summary?.charts?.line?.attendancePct || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      }
    ]
  }), [summary]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
         <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 font-medium">{stat.change} from last month</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students & Staff Overview</h3>
          <div className="h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
          <div className="h-64">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <div className="h-64">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
             {(summary?.recentActivity || []).map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'student' ? 'bg-blue-500' :
                  activity.type === 'payment' ? 'bg-green-500' :
                  activity.type === 'staff' ? 'bg-purple-500' :
                  activity.type === 'exam' ? 'bg-yellow-500' : 'bg-pink-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                   <p className="text-sm text-gray-500">{activity.name}</p>
                </div>
                 <div className="text-sm text-gray-400">{new Date(activity.time).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;