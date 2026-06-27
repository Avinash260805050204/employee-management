import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import shiftService from '../services/shiftService';
import employeeService from '../services/employeeService';
import CustomTable from '../components/CustomTable';
import Modal from '../components/Modal';
import { CalendarRange, Clock, Plus, UserCheck, AlertCircle } from 'lucide-react';

const Shifts = () => {
  const { user, isAdmin } = useAuth();

  // States
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form states
  const [shiftFormData, setShiftFormData] = useState({
    shift_name: '',
    start_time: '',
    end_time: ''
  });
  
  const [assignFormData, setAssignFormData] = useState({
    employee_id: '',
    shift_id: ''
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchShifts = async () => {
    try {
      const res = await shiftService.getShifts();
      if (res.success) {
        setShifts(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getEmployees();
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (isAdmin) {
      await Promise.all([fetchShifts(), fetchEmployees()]);
    } else {
      await fetchShifts();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleCreateShift = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await shiftService.createShift(shiftFormData);
      if (res.success) {
        alert('Shift pattern created successfully');
        setShiftFormData({ shift_name: '', start_time: '', end_time: '' });
        setIsCreateModalOpen(false);
        fetchShifts();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create shift');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await shiftService.assignShift(assignFormData.employee_id, assignFormData.shift_id);
      if (res.success) {
        alert('Shift assigned successfully');
        setIsAssignModalOpen(false);
        if (isAdmin) {
          fetchEmployees();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Columns for schedule overview table (Admin)
  const scheduleColumns = [
    { header: 'Emp ID', accessor: 'employee_id' },
    { header: 'Employee', accessor: 'name' },
    { header: 'Department', accessor: 'department' },
    { header: 'Designation', accessor: 'designation' },
    { 
      header: 'Assigned Shift', 
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${
          row.shift_name 
            ? 'text-steel-400 bg-steel-500/10 border-steel-500/20' 
            : 'text-slate-500 bg-slate-800 border-slate-700/60'
        }`}>
          {row.shift_name || 'No Shift'}
        </span>
      )
    },
    { 
      header: 'Shift Timings', 
      render: (row) => row.shift_name ? `${row.start_time.slice(0, 5)} - ${row.end_time.slice(0, 5)}` : '-- : --'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Shift patterns grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-steel-400" />
            Active Shift Patterns
          </h3>
          {isAdmin && (
            <button
              onClick={() => {
                setFormError('');
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-steel-500 text-slate-300 hover:text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Shift
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shifts.map(shift => (
            <div key={shift.id} className="glass-card p-5 rounded-xl border border-slate-800 flex items-start justify-between">
              <div>
                <h4 className="font-bold text-white">{shift.shift_name}</h4>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {shift.start_time.slice(0, 5)} to {shift.end_time.slice(0, 5)}
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold text-steel-400 bg-steel-500/10 border border-steel-500/20 px-2 py-0.5 rounded">
                8 Hours
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Panel Schedule Grid */}
      {isAdmin ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-steel-400" />
              Staff Rosters Schedule
            </h3>
            <button
              onClick={() => {
                setFormError('');
                setIsAssignModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-steel-600 hover:bg-steel-500 text-white text-xs font-semibold rounded-lg px-3 py-1.5 shadow transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Assign Shift
            </button>
          </div>

          <CustomTable 
            columns={scheduleColumns} 
            data={employees} 
            loading={loading}
            emptyMessage="No employees found to show roster."
          />
        </div>
      ) : (
        /* Regular employee view of shift */
        <div className="glass-card p-6 rounded-xl border border-slate-800/80">
          <h3 className="text-base font-bold text-white mb-4">Your Shift Assignment</h3>
          {user?.shift_name ? (
            <div className="flex items-center gap-6 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="p-3 bg-steel-500/10 text-steel-400 border border-steel-500/20 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-lg">{user.shift_name}</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Scheduled Timings: <span className="text-steel-400 font-semibold">{user.start_time.slice(0, 5)} - {user.end_time.slice(0, 5)}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Please log check-in within 15 minutes of scheduled start to avoid late logging.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 text-sm border border-slate-850 rounded-xl bg-slate-900/25">
              You are currently not assigned to any recurring shift pattern. Contact system admin for rosters.
            </div>
          )}
        </div>
      )}

      {/* Create Shift Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Shift Pattern"
      >
        <form onSubmit={handleCreateShift} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Shift Name
            </label>
            <input
              type="text"
              value={shiftFormData.shift_name}
              onChange={e => setShiftFormData({ ...shiftFormData, shift_name: e.target.value })}
              placeholder="e.g. Afternoon Shift"
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={shiftFormData.start_time}
                onChange={e => setShiftFormData({ ...shiftFormData, start_time: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={shiftFormData.end_time}
                onChange={e => setShiftFormData({ ...shiftFormData, end_time: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-850">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-850 text-slate-400 hover:text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-steel-600 hover:bg-steel-500 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Pattern'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Shift Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Shift Pattern"
      >
        <form onSubmit={handleAssignShift} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Employee
            </label>
            <select
              value={assignFormData.employee_id}
              onChange={e => setAssignFormData({ ...assignFormData, employee_id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
              required
            >
              <option value="">Choose Employee</option>
              {employees.map(emp => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.name} ({emp.employee_id}) - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Shift Schedule
            </label>
            <select
              value={assignFormData.shift_id}
              onChange={e => setAssignFormData({ ...assignFormData, shift_id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
              required
            >
              <option value="">No Shift / Deassign</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.shift_name} ({s.start_time.slice(0,5)} - {s.end_time.slice(0,5)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-850">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 border border-slate-850 text-slate-400 hover:text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-steel-600 hover:bg-steel-500 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Assigning...' : 'Assign Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Shifts;
