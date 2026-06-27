const Attendance = require('../models/Attendance');

// @desc    Record Check In
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const checkInTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

    // Check if already checked in today
    const existingRecord = await Attendance.findByDateAndEmployee(employeeId, today);
    if (existingRecord && existingRecord.check_in) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today'
      });
    }

    // Determine status (Late vs Present) based on assigned shift start_time
    let status = 'Present';
    if (req.user.start_time) {
      const [shiftHour, shiftMin] = req.user.start_time.split(':').map(Number);
      const shiftStart = new Date(now);
      shiftStart.setHours(shiftHour, shiftMin, 0, 0);

      // Grace period of 15 minutes
      const graceTime = new Date(shiftStart.getTime() + 15 * 60 * 1000);
      if (now > graceTime) {
        status = 'Late';
      }
    }

    const record = await Attendance.checkIn(employeeId, today, checkInTime, status);
    res.status(200).json({
      success: true,
      message: status === 'Late' ? 'Checked in successfully (Late)' : 'Checked in successfully',
      data: record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record Check Out
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

    // Verify check-in exists
    const record = await Attendance.findByDateAndEmployee(employeeId, today);
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check out without checking in first'
      });
    }

    if (record.check_out) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today'
      });
    }

    const updatedRecord = await Attendance.checkOut(employeeId, today, checkOutTime);
    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: updatedRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's attendance status for logged-in user
// @route   GET /api/attendance/today
// @access  Private
const getTodayStatus = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    const today = new Date().toISOString().split('T')[0];
    const record = await Attendance.findByDateAndEmployee(employeeId, today);
    
    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history of logged-in user
// @route   GET /api/attendance/history
// @access  Private
const getAttendanceHistory = async (req, res, next) => {
  try {
    const records = await Attendance.findHistory(req.user.employee_id);
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance records (with filters)
// @route   GET /api/attendance/records
// @access  Private (Admin only)
const getAllAttendanceRecords = async (req, res, next) => {
  try {
    const { date, department } = req.query;
    const records = await Attendance.findAllRecords({ date, department });
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly attendance reports
// @route   GET /api/attendance/monthly-report
// @access  Private
const getMonthlyReport = async (req, res, next) => {
  try {
    const { employee_id, year, month } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || (new Date().getMonth() + 1);
    
    let reportData;
    
    if (req.user.role === 'Admin' && employee_id) {
      reportData = await Attendance.getMonthlyReport(employee_id, currentYear, currentMonth);
    } else if (req.user.role === 'Admin') {
      reportData = await Attendance.getMonthlySummary(currentYear, currentMonth);
    } else {
      // Regular user gets only their own monthly details
      reportData = await Attendance.getMonthlyReport(req.user.employee_id, currentYear, currentMonth);
    }

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayStatus,
  getAttendanceHistory,
  getAllAttendanceRecords,
  getMonthlyReport
};
