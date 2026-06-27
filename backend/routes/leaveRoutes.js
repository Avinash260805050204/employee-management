const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getLeaveHistory,
  getPendingLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateLeave } = require('../middleware/validationMiddleware');

router.post('/apply', protect, validateLeave, applyLeave);
router.get('/history', protect, getLeaveHistory);
router.get('/pending', protect, authorize('Admin'), getPendingLeaves);
router.get('/', protect, authorize('Admin'), getAllLeaves);
router.put('/:id/status', protect, authorize('Admin'), updateLeaveStatus);

module.exports = router;
