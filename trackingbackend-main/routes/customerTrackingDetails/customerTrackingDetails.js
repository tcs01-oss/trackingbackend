const express = require('express');
const router = express.Router();
const customerTrackingController = require('../../controllers/customerTrackingDetails/customerTrackingDetails');

// Route to get tracking details by tracking ID
router.get('/customer-tracking/:tracking_id', customerTrackingController.getTrackingDetails);

module.exports = router;
