const validateRegistration = (req, res, next) => {
  const { employee_id, name, email, password, joining_date } = req.body;
  
  if (!employee_id || !name || !email || !password || !joining_date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide employee_id, name, email, password, and joining_date'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { employee_id, password } = req.body;
  if (!employee_id || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide employee_id and password'
    });
  }
  next();
};

const validateLeave = (req, res, next) => {
  const { leave_type, start_date, end_date, reason } = req.body;
  if (!leave_type || !start_date || !end_date || !reason) {
    return res.status(400).json({
      success: false,
      message: 'Please provide leave_type, start_date, end_date, and reason'
    });
  }

  const start = new Date(start_date);
  const end = new Date(end_date);

  if (end < start) {
    return res.status(400).json({
      success: false,
      message: 'End date cannot be earlier than start date'
    });
  }

  next();
};

const validateShift = (req, res, next) => {
  const { shift_name, start_time, end_time } = req.body;
  if (!shift_name || !start_time || !end_time) {
    return res.status(400).json({
      success: false,
      message: 'Please provide shift_name, start_time, and end_time'
    });
  }
  next();
};

const validateMaintenance = (req, res, next) => {
  const { machine_id, issue_title, description, priority } = req.body;
  if (!machine_id || !issue_title || !description || !priority) {
    return res.status(400).json({
      success: false,
      message: 'Please provide machine_id, issue_title, description, and priority'
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateLeave,
  validateShift,
  validateMaintenance
};
