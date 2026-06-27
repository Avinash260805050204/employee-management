const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Machine = require('../models/Machine');
const Maintenance = require('../models/Maintenance');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin, Technician, Employee)
const getEmployees = async (req, res, next) => {
  try {
    const { search, department, shift_id } = req.query;
    const employees = await Employee.findAll({ search, department, shift_id });
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee profile
// @route   GET /api/employees/:employee_id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findByEmployeeId(req.params.employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    delete employee.password;
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private (Admin only)
const createEmployee = async (req, res, next) => {
  try {
    const { employee_id, name, email, phone, department, designation, joining_date, password, role, shift_id } = req.body;

    const employeeExists = await Employee.findByEmployeeId(employee_id);
    if (employeeExists) {
      return res.status(400).json({ success: false, message: 'Employee ID already registered' });
    }

    const emailExists = await Employee.findByEmail(email);
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'welcome123', salt);

    const newEmployee = await Employee.create({
      employee_id,
      name,
      email,
      phone,
      department,
      designation,
      joining_date,
      password: hashedPassword,
      role: role || 'Employee',
      shift_id: shift_id || null
    });

    delete newEmployee.password;

    res.status(201).json({
      success: true,
      data: newEmployee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:employee_id
// @access  Private (Admin or Self)
const updateEmployee = async (req, res, next) => {
  try {
    // Non-admin can only update themselves
    if (req.user.role !== 'Admin' && req.user.employee_id !== req.params.employee_id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const employee = await Employee.findByEmployeeId(req.params.employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Keep fields or use new values
    const updateData = {
      name: req.body.name || employee.name,
      email: req.body.email || employee.email,
      phone: req.body.phone !== undefined ? req.body.phone : employee.phone,
      department: req.body.department || employee.department,
      designation: req.body.designation || employee.designation,
      joining_date: req.body.joining_date || employee.joining_date,
      role: req.user.role === 'Admin' ? (req.body.role || employee.role) : employee.role,
      shift_id: req.user.role === 'Admin' ? (req.body.shift_id !== undefined ? req.body.shift_id : employee.shift_id) : employee.shift_id
    };

    // If password is sent, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      await Employee.updatePassword(req.params.employee_id, hashedPassword);
    }

    const updatedEmployee = await Employee.update(req.params.employee_id, updateData);
    delete updatedEmployee.password;

    res.status(200).json({
      success: true,
      data: updatedEmployee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:employee_id
// @access  Private (Admin only)
const deleteEmployee = async (req, res, next) => {
  try {
    if (req.user.employee_id === req.params.employee_id) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own profile' });
    }

    const deleted = await Employee.delete(req.params.employee_id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Employee record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics and charts
// @route   GET /api/employees/dashboard/stats
// @access  Private (Admin, Employee, Technician)
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Core KPIs
    const employeeStats = await Employee.getDashboardStats();
    const presentToday = await Attendance.getTodayStats();
    const pendingLeaves = await Leave.getPendingCount();
    const openMaintenance = await Maintenance.getOpenCount();
    const machineSummary = await Machine.getSummary();

    // 2. Chart Analytics
    const attendanceAnalytics = await Attendance.getAttendanceAnalytics(7);
    const leaveStatusStats = await Leave.getLeaveAnalytics();
    const leaveTypeStats = await Leave.getLeaveTypeStats();
    const maintenanceStatusStats = await Maintenance.getMaintenanceAnalytics();
    const maintenancePriorityStats = await Maintenance.getPriorityStats();

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalEmployees: employeeStats.total,
          presentToday,
          pendingLeaves,
          openMaintenance,
          machineSummary: machineSummary.reduce((acc, curr) => {
            acc[curr.status.toLowerCase()] = curr.count;
            return acc;
          }, { operational: 0, 'under maintenance': 0, broken: 0 })
        },
        charts: {
          attendance: attendanceAnalytics,
          leaves: {
            byStatus: leaveStatusStats,
            byType: leaveTypeStats
          },
          maintenance: {
            byStatus: maintenanceStatusStats,
            byPriority: maintenancePriorityStats
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDashboardStats
};
