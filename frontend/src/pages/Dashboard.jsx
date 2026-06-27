import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import employeeService from '../services/employeeService';
import StatCard from '../components/StatCard';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { 
  Users, 
  UserCheck, 
  Wrench, 
  FileText, 
  Activity, 
  CalendarRange, 
  AlertOctagon, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user, isAdmin, isTechnician } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await employeeService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard metrics. Check DB connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 border-t-2 border-b-2 rounded-full border-steel-400 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-900/50 rounded-xl text-red-200">
        <h3 className="font-bold text-lg">System Error</h3>
        <p className="mt-2 text-sm">{error}</p>
        <p className="mt-4 text-xs text-slate-500">Ensure MySQL is running and migrations have been executed.</p>
      </div>
    );
  }

  const { kpis, charts } = stats || {};

  // 1. Attendance Chart Configuration
  const attendanceChartData = {
    labels: charts?.attendance?.map(d => d.date) || [],
    datasets: [
      {
        fill: true,
        label: 'Present',
        data: charts?.attendance?.map(d => d.present) || [],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        tension: 0.3
      },
      {
        fill: true,
        label: 'Half Day',
        data: charts?.attendance?.map(d => d.half_day) || [],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3
      }
    ]
  };

  const attendanceChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8' } }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', stepSize: 1 } }
    }
  };

  // 2. Maintenance Status Chart Config
  const maintenanceChartData = {
    labels: charts?.maintenance?.byStatus?.map(s => s.status) || ['Open', 'In Progress', 'Resolved'],
    datasets: [
      {
        label: 'Breakdowns',
        data: charts?.maintenance?.byStatus?.map(s => s.count) || [0, 0, 0],
        backgroundColor: ['#ef4444', '#f97316', '#10b981', '#64748b'],
        borderWidth: 1,
        borderColor: '#0f172a'
      }
    ]
  };

  // 3. Leaves by Type Chart Config
  const leavesChartData = {
    labels: charts?.leaves?.byType?.map(l => l.leave_type) || ['Casual', 'Sick', 'Paid'],
    datasets: [
      {
        label: 'Leave Requests',
        data: charts?.leaves?.byType?.map(l => l.count) || [0, 0, 0],
        backgroundColor: ['#a855f7', '#06b6d4', '#ec4899'],
        borderWidth: 1,
        borderColor: '#0f172a'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } }
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-steel-950 border border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back, {user?.name}</h2>
          <p className="text-sm text-slate-400 mt-1">
            Plant Operations Role: <span className="text-steel-300 font-semibold capitalize">{user?.role}</span> | Department: <span className="text-slate-300 font-semibold">{user?.department || 'N/A'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/attendance" 
            className="flex items-center gap-2 px-4 py-2 bg-steel-600 hover:bg-steel-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            Check-In Panel
          </Link>
          <Link 
            to="/maintenance" 
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            <Wrench className="w-4 h-4" />
            Report Breakdown
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Employees" 
          value={kpis?.totalEmployees || 0} 
          icon={Users} 
          description="Registered plant staff" 
          trend="+2 this month" 
          trendType="positive"
        />
        <StatCard 
          title="Present Today" 
          value={kpis?.presentToday || 0} 
          icon={UserCheck} 
          description="Active operators checked-in" 
          trend="85% occupancy" 
          trendType="positive"
        />
        <StatCard 
          title="Open Breakdowns" 
          value={kpis?.openMaintenance || 0} 
          icon={Wrench} 
          description="Reported machine faults" 
          trend={kpis?.openMaintenance > 0 ? "Requires action" : "All clear"} 
          trendType={kpis?.openMaintenance > 0 ? "negative" : "positive"}
        />
        <StatCard 
          title="Pending Leaves" 
          value={kpis?.pendingLeaves || 0} 
          icon={FileText} 
          description="Awaiting approval" 
          trend={kpis?.pendingLeaves > 0 ? `${kpis.pendingLeaves} reviews` : "No pending"} 
          trendType={kpis?.pendingLeaves > 0 ? "neutral" : "positive"}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Analytics */}
        <div className="lg:col-span-2 glass-card p-6 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-400" />
              Daily Attendance Trends (Past 7 Days)
            </h3>
          </div>
          <div className="h-72 flex items-center justify-center">
            {charts?.attendance?.length > 0 ? (
              <Line data={attendanceChartData} options={attendanceChartOptions} />
            ) : (
              <p className="text-sm text-slate-500">No attendance data logged in the last 7 days.</p>
            )}
          </div>
        </div>

        {/* Machine Status Summary */}
        <div className="glass-card p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-industrial-orange" />
              Machine Status Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">Operational</span>
                </div>
                <span className="text-base font-bold text-emerald-400">{kpis?.machineSummary?.operational || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">Under Maintenance</span>
                </div>
                <span className="text-base font-bold text-amber-400">{kpis?.machineSummary?.['under maintenance'] || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-rose-500/10 text-rose-400">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">Broken</span>
                </div>
                <span className="text-base font-bold text-rose-400">{kpis?.machineSummary?.broken || 0}</span>
              </div>
            </div>
          </div>

          <Link 
            to="/maintenance" 
            className="w-full text-center mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
          >
            Manage Machinery List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown Status Distribution */}
        <div className="glass-card p-6 rounded-xl border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-rose-400" />
            Maintenance Request Statuses
          </h3>
          <div className="h-64 flex items-center justify-center">
            {charts?.maintenance?.byStatus?.length > 0 ? (
              <Doughnut data={maintenanceChartData} options={doughnutOptions} />
            ) : (
              <p className="text-sm text-slate-500">No breakdowns reported yet.</p>
            )}
          </div>
        </div>

        {/* Leaves Distribution */}
        <div className="glass-card p-6 rounded-xl border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <CalendarRange className="w-5 h-5 text-purple-400" />
            Leaves applied by Categories
          </h3>
          <div className="h-64 flex items-center justify-center">
            {charts?.leaves?.byType?.length > 0 ? (
              <Doughnut data={leavesChartData} options={doughnutOptions} />
            ) : (
              <p className="text-sm text-slate-500">No leave records registered.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
