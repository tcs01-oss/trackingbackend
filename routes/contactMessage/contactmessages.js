const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/contactMessage/contactmessages');
const authMiddleware = require('../../middleware/authMiddleware');
// Route to create a new contact message
router.post('/contactmessages', contactController.createContactMessage);
// Route to delete a contact message
router.delete('/contactmessages/:id', authMiddleware, contactController.deleteContactMessage);

// Route to get all contact messages
router.get('/contact', authMiddleware, contactController.getContactMessages);

module.exports = router;
