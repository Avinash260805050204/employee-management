const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const protect = async (req, res, next) => {
  // Support demo mode with X-Employee-ID header bypass
  const simulatedEmpId = req.headers['x-employee-id'];
  if (simulatedEmpId) {
    try {
      const user = await Employee.findByEmployeeId(simulatedEmpId);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (e) {
      console.error('Simulated authentication error:', e.message);
    }
  }

  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecuresecretkey12345!@#');

      // Get user from the token, exclude password
      const user = await Employee.findByEmployeeId(decoded.employee_id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, employee not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth protect error:', error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token && !simulatedEmpId) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Limit access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
