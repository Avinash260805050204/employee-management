const Maintenance = require('../models/Maintenance');
const Machine = require('../models/Machine');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

// @desc    Get all machines
// @route   GET /api/maintenance/machines
// @access  Private
const getMachines = async (req, res, next) => {
  try {
    const machines = await Machine.findAll();
    res.status(200).json({
      success: true,
      data: machines
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new machine
// @route   POST /api/maintenance/machines
// @access  Private (Admin only)
const createMachine = async (req, res, next) => {
  try {
    const { machine_id, name, location, status } = req.body;
    if (!machine_id || !name || !location) {
      return res.status(400).json({ success: false, message: 'Please provide machine_id, name, and location' });
    }

    const exists = await Machine.findById(machine_id);
    if (exists) {
      return res.status(400).json({ success: false, message: 'Machine ID already exists' });
    }

    const machine = await Machine.create({ machine_id, name, location, status });
    res.status(201).json({
      success: true,
      message: 'Machine registered successfully',
      data: machine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report machine breakdown
// @route   POST /api/maintenance/report
// @access  Private
const reportBreakdown = async (req, res, next) => {
  try {
    const { machine_id, issue_title, description, priority } = req.body;
    const reportedBy = req.user.employee_id;

    // Check machine exists
    const machine = await Machine.findById(machine_id);
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }

    // Image file path (if uploaded)
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const request = await Maintenance.createRequest({
      machine_id,
      issue_title,
      description,
      priority,
      image_url,
      reported_by: reportedBy
    });

    // Notify all Admins
    const admins = await Employee.findAll({ role: 'Admin' });
    const notificationPromises = admins
      .filter(admin => admin.role === 'Admin')
      .map(admin => 
        Notification.create(
          admin.employee_id,
          `Breakdown Reported: ${machine.name}`,
          `A ${priority} issue "${issue_title}" was reported on machine ${machine.name} in ${machine.location} by ${req.user.name}.`,
          'Maintenance'
        )
      );
    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'Breakdown reported successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get maintenance requests
// @route   GET /api/maintenance/requests
// @access  Private
const getMaintenanceRequests = async (req, res, next) => {
  try {
    const { status, priority, technician_id } = req.query;
    
    let requests;
    if (req.user.role === 'Technician') {
      // Techs view requests assigned to them by default
      requests = await Maintenance.findAllRequests({ 
        status, 
        priority, 
        technician_id: req.user.employee_id 
      });
    } else {
      requests = await Maintenance.findAllRequests({ status, priority, technician_id });
    }

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign technician
// @route   PUT /api/maintenance/assign-tech
// @access  Private (Admin only)
const assignTechnician = async (req, res, next) => {
  try {
    const { request_id, technician_id } = req.body;

    if (!request_id || !technician_id) {
      return res.status(400).json({ success: false, message: 'Please provide request_id and technician_id' });
    }

    // Verify request exists
    const request = await Maintenance.findById(request_id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Verify technician exists and is a technician
    const technician = await Employee.findByEmployeeId(technician_id);
    if (!technician || technician.role !== 'Technician') {
      return res.status(400).json({ success: false, message: 'Invalid employee. Must be a Technician.' });
    }

    const updatedRequest = await Maintenance.assignTechnician(request_id, technician_id);

    // Notify the technician
    await Notification.create(
      technician_id,
      'New Maintenance Assignment',
      `You have been assigned to repair machine ${request.machine_name} in ${request.location}. Issue: ${request.issue_title}.`,
      'Maintenance'
    );

    res.status(200).json({
      success: true,
      message: 'Technician assigned successfully',
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update repair status
// @route   PUT /api/maintenance/status/:id
// @access  Private (Admin & Technician)
const updateRepairStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid maintenance status' });
    }

    const request = await Maintenance.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Tech can only update if assigned to them
    if (req.user.role === 'Technician' && request.assigned_technician_id !== req.user.employee_id) {
      return res.status(403).json({ success: false, message: 'Not authorized. You are not assigned to this request.' });
    }

    const updatedRequest = await Maintenance.updateStatus(requestId, status);

    // Notify the reporter
    await Notification.create(
      request.reported_by,
      'Maintenance Status Updated',
      `The status of reported breakdown for ${request.machine_name} (${request.issue_title}) has been updated to "${status}" by ${req.user.name}.`,
      'Maintenance'
    );

    res.status(200).json({
      success: true,
      message: 'Repair status updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMachines,
  createMachine,
  reportBreakdown,
  getMaintenanceRequests,
  assignTechnician,
  updateRepairStatus
};
