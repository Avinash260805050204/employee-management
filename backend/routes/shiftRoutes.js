const express = require('express');
const router = express.Router();
const {
  getShifts,
  createShift,
  assignShift
} = require('../controllers/shiftController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateShift } = require('../middleware/validationMiddleware');

router.get('/', protect, getShifts);
router.post('/', protect, authorize('Admin'), validateShift, createShift);
router.put('/assign', protect, authorize('Admin'), assignShift);

module.exports = router;
