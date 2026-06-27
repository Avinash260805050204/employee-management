const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getAttendanceHistory,
  getAllAttendanceRecords,
  getMonthlyReport
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/today', protect, getTodayStatus);
router.get('/history', protect, getAttendanceHistory);
router.get('/records', protect, authorize('Admin'), getAllAttendanceRecords);
router.get('/monthly-report', protect, getMonthlyReport);

module.exports = router;
