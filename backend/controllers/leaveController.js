const Leave = require('../models/Leave');
const Notification = require('../models/Notification');
const Employee = require('../models/Employee');

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private
const applyLeave = async (req, res, next) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    const employeeId = req.user.employee_id;

    const leave = await Leave.apply({
      employee_id: employeeId,
      leave_type,
      start_date,
      end_date,
      reason
    });

    // Notify all Admins of new leave request
    const admins = await Employee.findAll({ role: 'Admin' });
    const notificationPromises = admins
      .filter(admin => admin.role === 'Admin')
      .map(admin => 
        Notification.create(
          admin.employee_id,
          'New Leave Request Submitted',
          `Employee ${req.user.name} (${employeeId}) has requested ${leave_type} from ${start_date} to ${end_date}.`,
          'Leave'
        )
      );
    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave history for logged-in employee
// @route   GET /api/leaves/history
// @access  Private
const getLeaveHistory = async (req, res, next) => {
  try {
    const history = await Leave.findHistory(req.user.employee_id);
    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending leave requests
// @route   GET /api/leaves/pending
// @access  Private (Admin only)
const getPendingLeaves = async (req, res, next) => {
  try {
    const pending = await Leave.findPending();
    res.status(200).json({
      success: true,
      count: pending.length,
      data: pending
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private (Admin only)
const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.findAll();
    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject leave request
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin only)
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const leaveId = req.params.id;
    const adminId = req.user.employee_id;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Approved or Rejected'
      });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Leave request has already been ${leave.status.toLowerCase()}`
      });
    }

    const updatedLeave = await Leave.updateStatus(leaveId, status, adminId);

    // Notify employee of the decision
    await Notification.create(
      leave.employee_id,
      `Leave Request ${status}`,
      `Your leave request for ${leave.leave_type} (${leave.start_date} to ${leave.end_date}) has been ${status.toLowerCase()} by ${req.user.name}.`,
      'Leave'
    );

    res.status(200).json({
      success: true,
      message: `Leave request successfully ${status.toLowerCase()}`,
      data: updatedLeave
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getLeaveHistory,
  getPendingLeaves,
  getAllLeaves,
  updateLeaveStatus
};
