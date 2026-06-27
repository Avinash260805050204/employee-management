const express = require('express');
const router = express.Router();
const {
  getMachines,
  createMachine,
  reportBreakdown,
  getMaintenanceRequests,
  assignTechnician,
  updateRepairStatus
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateMaintenance } = require('../middleware/validationMiddleware');

router.get('/machines', protect, getMachines);
router.post('/machines', protect, authorize('Admin'), createMachine);

// Note: upload.single('image') must run before validateMaintenance so req.body is parsed
router.post('/report', protect, upload.single('image'), validateMaintenance, reportBreakdown);

router.get('/requests', protect, getMaintenanceRequests);
router.put('/assign-tech', protect, authorize('Admin'), assignTechnician);
router.put('/status/:id', protect, authorize('Admin', 'Technician'), updateRepairStatus);

module.exports = router;
