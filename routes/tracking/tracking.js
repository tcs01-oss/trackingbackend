const express = require('express');
const router = express.Router();
const controller = require('../../controllers/tracking/tracking');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/tracking', controller.createTracking);
router.delete('/tracking/:id', authMiddleware, controller.deleteTracking);
router.get('/tracking', authMiddleware, controller.getTrackings);

module.exports = router;

