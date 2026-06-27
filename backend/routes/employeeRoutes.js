const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDashboardStats
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getEmployees);
router.get('/dashboard/stats', protect, getDashboardStats);
router.post('/', protect, authorize('Admin'), createEmployee);

router.route('/:employee_id')
  .get(protect, getEmployeeById)
  .put(protect, updateEmployee)
  .delete(protect, authorize('Admin'), deleteEmployee);

module.exports = router;
