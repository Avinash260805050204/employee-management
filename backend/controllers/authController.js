const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

const generateToken = (employeeId) => {
  return jwt.sign(
    { employee_id: employeeId },
    process.env.JWT_SECRET || 'supersecuresecretkey12345!@#',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// @desc    Register a new employee
// @route   POST /api/auth/register
// @access  Public (for initial setup) / Admin (for normal ops)
const register = async (req, res, next) => {
  try {
    const { employee_id, name, email, phone, department, designation, joining_date, password, role, shift_id } = req.body;

    // Check if employee already exists by ID
    const employeeExists = await Employee.findByEmployeeId(employee_id);
    if (employeeExists) {
      return res.status(400).json({ success: false, message: 'Employee ID already registered' });
    }

    // Check if email already exists
    const emailExists = await Employee.findByEmail(email);
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create employee
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

    // Remove password from response
    delete newEmployee.password;

    res.status(201).json({
      success: true,
      data: newEmployee,
      token: generateToken(newEmployee.employee_id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth employee & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { employee_id, password } = req.body;

    // Find employee
    const employee = await Employee.findByEmployeeId(employee_id);
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Invalid Employee ID or Password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Employee ID or Password' });
    }

    // Generate token
    const token = generateToken(employee.employee_id);

    // Remove password from returned employee details
    delete employee.password;

    res.status(200).json({
      success: true,
      data: employee,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const employee = await Employee.findByEmployeeId(req.user.employee_id);
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

module.exports = {
  register,
  login,
  getMe
};
