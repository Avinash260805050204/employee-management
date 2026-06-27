import React, { useState, useEffect } from 'react';
import employeeService from '../services/employeeService';
import shiftService from '../services/shiftService';
import CustomTable from '../components/CustomTable';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus, Edit2, Trash2, Shield, Hammer, Clipboard } from 'lucide-react';

const Employees = () => {
  const { user: currentUser } = useAuth();
  
  // State
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joining_date: '',
    password: '',
    role: 'Employee',
    shift_id: ''
  });
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch list
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getEmployees({
        search,
        department: selectedDept,
        shift_id: selectedShift
      });
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch shifts for dropdown
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

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept, selectedShift]);

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      employee_id: '',
      name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      joining_date: new Date().toISOString().split('T')[0],
      password: '',
      role: 'Employee',
      shift_id: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setModalMode('edit');
    setSelectedEmployee(emp);
    setFormData({
      employee_id: emp.employee_id,
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department || '',
      designation: emp.designation || '',
      joining_date: emp.joining_date,
      password: '', // blank by default for edit
      role: emp.role,
      shift_id: emp.shift_id || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm(`Are you sure you want to delete employee ${employeeId}?`)) {
      try {
        const res = await employeeService.deleteEmployee(employeeId);
        if (res.success) {
          alert('Employee deleted successfully');
          fetchEmployees();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete employee');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitLoading(true);

    try {
      if (modalMode === 'create') {
        const res = await employeeService.createEmployee(formData);
        if (res.success) {
          setIsModalOpen(false);
          fetchEmployees();
        }
      } else {
        const res = await employeeService.updateEmployee(selectedEmployee.employee_id, formData);
        if (res.success) {
          setIsModalOpen(false);
          fetchEmployees();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Verify inputs.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Departments list for filter
  const departments = ['Management', 'Maintenance', 'Production', 'Logistics', 'Quality Assurance'];

  // Table Columns config
  const columns = [
    { header: 'ID', accessor: 'employee_id' },
    { 
      header: 'Name', 
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.name}</p>
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      )
    },
    { header: 'Department', accessor: 'department' },
    { header: 'Designation', accessor: 'designation' },
    { 
      header: 'Role', 
      render: (row) => {
        const badgeColor = {
          Admin: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          Technician: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          Employee: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
        }[row.role];
        const Icon = {
          Admin: Shield,
          Technician: Hammer,
          Employee: Clipboard
        }[row.role];

        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
            <Icon className="w-3.5 h-3.5" />
            {row.role}
          </span>
        );
      }
    },
    { 
      header: 'Shift', 
      render: (row) => (
        <span className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
          {row.shift_name || 'No Shift'}
        </span>
      )
    },
    { 
      header: 'Actions', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Edit profile"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {currentUser?.employee_id !== row.employee_id && (
            <button 
              onClick={() => handleDelete(row.employee_id)}
              className="p-1.5 rounded bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition-colors"
              title="Delete employee"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, name, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-steel-500 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-steel-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Shift Filter */}
          <select
            value={selectedShift}
            onChange={e => setSelectedShift(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-steel-500"
          >
            <option value="">All Shifts</option>
            {shifts.map(shift => (
              <option key={shift.id} value={shift.id}>{shift.shift_name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-steel-600 hover:bg-steel-500 text-white font-semibold text-sm rounded-xl py-2 px-4 shadow transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Employees Table */}
      <CustomTable 
        columns={columns} 
        data={employees} 
        loading={loading} 
        emptyMessage="No employees found matching filter options."
      />

      {/* Create / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Register New Employee' : 'Edit Employee Details'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Employee ID
              </label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                disabled={modalMode === 'edit'}
                placeholder="EMP001"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500 disabled:opacity-55"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@steelplant.com"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="9876543210"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="e.g. Furnace Specialist"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Role (Authorization)
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              >
                <option value="Employee">Employee (Operator)</option>
                <option value="Technician">Technician</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Shift Schedule
              </label>
              <select
                name="shift_id"
                value={formData.shift_id}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
              >
                <option value="">No Shift Assigned</option>
                {shifts.map(shift => (
                  <option key={shift.id} value={shift.id}>{shift.shift_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Joining Date
              </label>
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password {modalMode === 'edit' && '(Leave blank to keep current)'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={modalMode === 'edit' ? '••••••••' : 'welcome123'}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required={modalMode === 'create'}
              />
            </div>
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
              disabled={submitLoading}
              className="px-4 py-2 bg-steel-600 hover:bg-steel-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {submitLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
