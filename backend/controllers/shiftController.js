const Shift = require('../models/Shift');
const Notification = require('../models/Notification');
const Employee = require('../models/Employee');

// @desc    Get all shifts
// @route   GET /api/shifts
// @access  Private
const getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.findAll();
    res.status(200).json({
      success: true,
      count: shifts.length,
      data: shifts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new shift
// @route   POST /api/shifts
// @access  Private (Admin only)
const createShift = async (req, res, next) => {
  try {
    const { shift_name, start_time, end_time } = req.body;
    const newShift = await Shift.create({ shift_name, start_time, end_time });
    res.status(201).json({
      success: true,
      message: 'New shift created successfully',
      data: newShift
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign shift to employee
// @route   PUT /api/shifts/assign
// @access  Private (Admin only)
const assignShift = async (req, res, next) => {
  try {
    const { employee_id, shift_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'Please provide employee_id' });
    }

    const employee = await Employee.findByEmployeeId(employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    let shift = null;
    if (shift_id) {
      shift = await Shift.findById(shift_id);
      if (!shift) {
        return res.status(404).json({ success: false, message: 'Shift pattern not found' });
      }
    }

    const updatedEmployee = await Shift.assignShift(employee_id, shift_id);

    // Send shift assignment reminder notification to employee
    if (shift) {
      await Notification.create(
        employee_id,
        'Shift Schedule Updated',
        `You have been assigned to "${shift.shift_name}" (${shift.start_time} to ${shift.end_time}). Please plan your attendance accordingly.`,
        'Shift'
      );
    } else {
      await Notification.create(
        employee_id,
        'Shift Deassigned',
        'Your shift schedule has been cleared. Contact your manager for assignments.',
        'Shift'
      );
    }

    res.status(200).json({
      success: true,
      message: 'Shift schedule updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShifts,
  createShift,
  assignShift
};
