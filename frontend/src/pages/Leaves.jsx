import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import leaveService from '../services/leaveService';
import CustomTable from '../components/CustomTable';
import Modal from '../components/Modal';
import { FileText, ClipboardList, CheckCircle, XCircle, Plus, AlertCircle } from 'lucide-react';

const Leaves = () => {
  const { user, isAdmin } = useAuth();
  
  // Navigation tabs for Admin: 'history' or 'pending'
  const [activeTab, setActiveTab] = useState(isAdmin ? 'pending' : 'history');
  
  // States
  const [personalHistory, setPersonalHistory] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    leave_type: 'Casual Leave',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchPersonalLeaves = async () => {
    try {
      const res = await leaveService.getLeaveHistory();
      if (res.success) {
        setPersonalHistory(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminLeaves = async () => {
    try {
      const pendingRes = await leaveService.getPendingLeaves();
      if (pendingRes.success) {
        setPendingRequests(pendingRes.data);
      }

      const allRes = await leaveService.getAllLeaves();
      if (allRes.success) {
        setAllRequests(allRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    if (isAdmin) {
      await Promise.all([fetchPersonalLeaves(), fetchAdminLeaves()]);
    } else {
      await fetchPersonalLeaves();
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [isAdmin]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    if (end < start) {
      setFormError('End date cannot be earlier than start date');
      return;
    }

    try {
      const res = await leaveService.applyLeave(formData);
      if (res.success) {
        setFormSuccess('Leave request submitted successfully');
        setFormData({
          leave_type: 'Casual Leave',
          start_date: '',
          end_date: '',
          reason: ''
        });
        fetchPersonalLeaves();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess('');
        }, 1500);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to apply leave. Check fields.');
    }
  };

  const handleStatusChange = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) return;
    setActionLoading(true);
    try {
      const res = await leaveService.updateLeaveStatus(id, status);
      if (res.success) {
        alert(`Leave request successfully ${status.toLowerCase()}`);
        fetchAdminLeaves();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Render Status Badge
  const renderStatus = (status) => {
    const color = {
      Pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      Approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      Rejected: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    }[status];

    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
        {status}
      </span>
    );
  };

  // Columns for personal history
  const personalColumns = [
    { header: 'Leave Type', accessor: 'leave_type' },
    { header: 'Start Date', accessor: 'start_date' },
    { header: 'End Date', accessor: 'end_date' },
    { header: 'Reason', accessor: 'reason', className: 'max-w-xs truncate' },
    { header: 'Status', render: (row) => renderStatus(row.status) },
    { header: 'Reviewed By', render: (row) => row.approved_by_name || 'Pending' }
  ];

  // Columns for admin pending
  const pendingColumns = [
    { header: 'Emp ID', accessor: 'employee_id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Department', accessor: 'department' },
    { header: 'Leave Type', accessor: 'leave_type' },
    { header: 'Duration', render: (row) => `${row.start_date} to ${row.end_date}` },
    { header: 'Reason', accessor: 'reason', className: 'max-w-xs truncate' },
    { 
      header: 'Actions', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleStatusChange(row.id, 'Approved')}
            disabled={actionLoading}
            className="p-1.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
            title="Approve Leave"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleStatusChange(row.id, 'Rejected')}
            disabled={actionLoading}
            className="p-1.5 rounded bg-rose-950/20 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
            title="Reject Leave"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Columns for admin all
  const allColumns = [
    { header: 'Emp ID', accessor: 'employee_id' },
    { header: 'Employee', accessor: 'name' },
    { header: 'Department', accessor: 'department' },
    { header: 'Leave Type', accessor: 'leave_type' },
    { header: 'Duration', render: (row) => `${row.start_date} to ${row.end_date}` },
    { header: 'Status', render: (row) => renderStatus(row.status) },
    { header: 'Approver', render: (row) => row.approved_by_name || 'N/A' }
  ];

  const leaveTypes = ['Sick Leave', 'Casual Leave', 'Paid Leave', 'Maternity/Paternity Leave', 'Compensatory Off'];

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Navigation tabs for Admin */}
        {isAdmin ? (
          <div className="flex border-b border-slate-800 space-x-4">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'pending' ? 'border-steel-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Pending Leaves
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'history' ? 'border-steel-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              All Leave Records
            </button>
          </div>
        ) : (
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-steel-400" />
            Your Leave History
          </h2>
        )}

        <button
          onClick={() => {
            setFormError('');
            setFormSuccess('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-steel-600 hover:bg-steel-500 text-white font-semibold text-sm rounded-xl py-2 px-4 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Tables depending on tab selection */}
      {isAdmin && activeTab === 'pending' ? (
        <CustomTable 
          columns={pendingColumns} 
          data={pendingRequests} 
          loading={loading}
          emptyMessage="No pending leave applications to review. Well done!"
        />
      ) : isAdmin && activeTab === 'history' ? (
        <CustomTable 
          columns={allColumns} 
          data={allRequests} 
          loading={loading}
          emptyMessage="No leave records logged in database."
        />
      ) : (
        <CustomTable 
          columns={personalColumns} 
          data={personalHistory} 
          loading={loading}
          emptyMessage="You haven't applied for leaves yet."
        />
      )}

      {/* Apply Leave Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Apply for Leave"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Leave Type
            </label>
            <select
              name="leave_type"
              value={formData.leave_type}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
              required
            >
              {leaveTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Reason for Leave
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              placeholder="Provide detail description for leave request approval..."
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
              required
            ></textarea>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-850">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-850 text-slate-400 hover:text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-steel-600 hover:bg-steel-500 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
