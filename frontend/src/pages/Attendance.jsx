import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import CustomTable from '../components/CustomTable';
import { Clock, Calendar, CheckSquare, LogIn, LogOut, FileText, Clipboard, Users } from 'lucide-react';

const Attendance = () => {
  const { user, isAdmin } = useAuth();
  
  // Tab control for Admin: 'check-in' or 'records' or 'reports'
  const [activeTab, setActiveTab] = useState('check-in');
  
  // Local time state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Personal status states
  const [todayStatus, setTodayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // Admin records filtering states
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDept, setFilterDept] = useState('');

  // Monthly report states
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportEmpId, setReportEmpId] = useState('');

  // Tick clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch personal logs
  const fetchPersonalData = async () => {
    try {
      const todayRes = await attendanceService.getTodayStatus();
      if (todayRes.success) {
        setTodayStatus(todayRes.data);
      }
      
      setLoadingHistory(true);
      const historyRes = await attendanceService.getAttendanceHistory();
      if (historyRes.success) {
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch admin logs
  const fetchAdminRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await attendanceService.getAllAttendanceRecords({
        date: filterDate,
        department: filterDept
      });
      if (res.success) {
        setRecords(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Fetch monthly summary/aggregations
  const fetchMonthlyReport = async () => {
    setLoadingReport(true);
    try {
      const res = await attendanceService.getMonthlyReport({
        year: reportYear,
        month: reportMonth,
        employee_id: reportEmpId
      });
      if (res.success) {
        // If it's an array of detailed logs or summary count
        setMonthlyReport(Array.isArray(res.data) ? res.data : [res.data]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchPersonalData();
  }, []);

  useEffect(() => {
    if (isAdmin && activeTab === 'records') {
      fetchAdminRecords();
    }
  }, [activeTab, filterDate, filterDept]);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchMonthlyReport();
    }
  }, [activeTab, reportYear, reportMonth, reportEmpId]);

  const handleCheckIn = async () => {
    setCheckLoading(true);
    setActionMsg({ type: '', text: '' });
    try {
      const res = await attendanceService.checkIn();
      if (res.success) {
        setActionMsg({ type: 'success', text: res.message });
        fetchPersonalData();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Check-in failed' });
    } finally {
      setCheckLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckLoading(true);
    setActionMsg({ type: '', text: '' });
    try {
      const res = await attendanceService.checkOut();
      if (res.success) {
        setActionMsg({ type: 'success', text: res.message });
        fetchPersonalData();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Check-out failed' });
    } finally {
      setCheckLoading(false);
    }
  };

  // Render Status Badge helper
  const renderStatus = (status) => {
    const color = {
      Present: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      Late: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      Absent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      'Half Day': 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    }[status] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';

    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
        {status}
      </span>
    );
  };

  // Columns for personal history
  const historyColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Shift Pattern', accessor: 'shift_name' },
    { header: 'Check In Time', render: (row) => row.check_in || '--:--:--' },
    { header: 'Check Out Time', render: (row) => row.check_out || '--:--:--' },
    { header: 'Status', render: (row) => renderStatus(row.status) }
  ];

  // Columns for admin logs
  const adminColumns = [
    { header: 'Emp ID', accessor: 'employee_id' },
    { header: 'Employee', accessor: 'name' },
    { header: 'Department', accessor: 'department' },
    { header: 'Shift', accessor: 'shift_name' },
    { header: 'Check In', render: (row) => row.check_in || '--:--:--' },
    { header: 'Check Out', render: (row) => row.check_out || '--:--:--' },
    { header: 'Status', render: (row) => renderStatus(row.status) }
  ];

  // Columns for reports
  const reportColumns = reportEmpId 
    ? [
        { header: 'Date', accessor: 'date' },
        { header: 'Check In', render: (row) => row.check_in || '--:--:--' },
        { header: 'Check Out', render: (row) => row.check_out || '--:--:--' },
        { header: 'Status', render: (row) => renderStatus(row.status) }
      ]
    : [
        { header: 'Emp ID', accessor: 'employee_id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Department', accessor: 'department' },
        { header: 'Presents', accessor: 'present_count' },
        { header: 'Lates', accessor: 'late_count' },
        { header: 'Half Days', accessor: 'half_day_count' },
        { header: 'Absents', accessor: 'absent_count' }
      ];

  const departments = ['Management', 'Maintenance', 'Production', 'Logistics', 'Quality Assurance'];
  const months = [
    { v: 1, n: 'January' }, { v: 2, n: 'February' }, { v: 3, n: 'March' }, { v: 4, n: 'April' },
    { v: 5, n: 'May' }, { v: 6, n: 'June' }, { v: 7, n: 'July' }, { v: 8, n: 'August' },
    { v: 9, n: 'September' }, { v: 10, n: 'October' }, { v: 11, n: 'November' }, { v: 12, n: 'December' }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation tabs for Admins */}
      {isAdmin && (
        <div className="flex border-b border-slate-800 space-x-4">
          <button
            onClick={() => setActiveTab('check-in')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'check-in' ? 'border-steel-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Check-In Panel
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'records' ? 'border-steel-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Daily Records
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'reports' ? 'border-steel-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Monthly Analytics
          </button>
        </div>
      )}

      {/* Tab 1: Check In Panel */}
      {activeTab === 'check-in' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clocking Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-[360px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-bold text-steel-400 tracking-wider">Clocking Station</span>
                <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700/60 rounded">
                  {user?.shift_name || 'No Shift'}
                </span>
              </div>

              {/* Time display */}
              <div className="text-center my-4">
                <h3 className="text-4xl font-extrabold text-white tracking-tight">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </h3>
                <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Status banner */}
              <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl mt-4 flex items-center justify-between text-xs text-slate-300">
                <div>
                  <p className="text-slate-500 font-semibold">Today's Shift Hours</p>
                  <p className="mt-0.5 text-steel-400 font-medium">
                    {user?.start_time ? `${user.start_time.slice(0, 5)} - ${user.end_time.slice(0, 5)}` : 'Flexible'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-semibold">Status Today</p>
                  <p className="mt-0.5">
                    {todayStatus ? renderStatus(todayStatus.status) : <span className="text-slate-500">Not Logged</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Checkin buttons */}
            <div className="space-y-3 mt-6">
              {actionMsg.text && (
                <div className={`p-2.5 rounded-lg text-xs border ${
                  actionMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {actionMsg.text}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleCheckIn}
                  disabled={checkLoading || (todayStatus && todayStatus.check_in)}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/10"
                >
                  <LogIn className="w-4 h-4" />
                  Check In
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={checkLoading || !todayStatus || !todayStatus.check_in || todayStatus.check_out}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors shadow-lg shadow-rose-600/10"
                >
                  <LogOut className="w-4 h-4" />
                  Check Out
                </button>
              </div>
            </div>
          </div>

          {/* Personal History Table */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between min-h-[360px]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Clipboard className="w-5 h-5 text-steel-400" />
                Personal Attendance Records
              </h3>
              <CustomTable 
                columns={historyColumns} 
                data={history} 
                loading={loadingHistory}
                emptyMessage="No attendance logs registered yet. Punch-in above to start."
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Records (Admin view) */}
      {isAdmin && activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-4 border border-slate-850 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Select Log Date</span>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-white rounded-lg p-2 text-sm focus:outline-none focus:border-steel-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Select Department</span>
              <select
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-steel-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <CustomTable 
            columns={adminColumns} 
            data={records} 
            loading={loadingRecords}
            emptyMessage={`No attendance reports registered for date ${filterDate}.`}
          />
        </div>
      )}

      {/* Tab 3: Monthly Analytics Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-4 border border-slate-850 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Select Year</span>
              <select
                value={reportYear}
                onChange={e => setReportYear(Number(e.target.value))}
                className="bg-slate-950 border border-slate-850 text-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-steel-500"
              >
                {[2026, 2025, 2024].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Select Month</span>
              <select
                value={reportMonth}
                onChange={e => setReportMonth(Number(e.target.value))}
                className="bg-slate-950 border border-slate-850 text-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-steel-500"
              >
                {months.map(m => (
                  <option key={m.v} value={m.v}>{m.n}</option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Filter Employee ID (Optional)</span>
                <input
                  type="text"
                  value={reportEmpId}
                  onChange={e => setReportEmpId(e.target.value)}
                  placeholder="e.g. EMP003"
                  className="bg-slate-950 border border-slate-850 text-white rounded-lg p-2 text-sm focus:outline-none focus:border-steel-500"
                />
              </div>
            )}
          </div>

          <CustomTable 
            columns={reportColumns} 
            data={monthlyReport} 
            loading={loadingReport}
            emptyMessage="No reports found for this month period."
          />
        </div>
      )}
    </div>
  );
};

export default Attendance;
