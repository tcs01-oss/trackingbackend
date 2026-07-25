const express = require('express');
const router = express.Router();
const trackingStatusController = require('../../controllers/tracking/trackingStatus');

// Add a new status update
router.post('/status', trackingStatusController.addStatusUpdate);

// Get status history for a specific tracking ID string
router.get('/status/:tracking_id', trackingStatusController.getStatusHistory);

// Update an existing status entry (by its own ID)
router.put('/status/:id', trackingStatusController.updateStatusUpdate);

module.exports = router;
