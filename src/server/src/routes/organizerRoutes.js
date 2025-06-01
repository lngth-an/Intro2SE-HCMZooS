const express = require('express');
const router = express.Router();
const OrganizerController = require('../module/organizer/organizerController');
const { authenticateToken } = require('../module/auth/authMiddleware');

// Get organizer statistics
router.get('/stats', authenticateToken, OrganizerController.getStats);

module.exports = router; 