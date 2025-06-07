const express = require('express');
const router = express.Router();
const ParticipationController = require('../module/participation/participationController');
const { authenticateToken, requireRole } = require('../module/auth/authMiddleware');

router.get('/open', authenticateToken, ParticipationController.getOpenActivities);
router.get('/check-eligibility/:activityID', authenticateToken, requireRole(['student']), ParticipationController.checkEligibility);
router.post('/register', authenticateToken, requireRole(['student']), ParticipationController.registerActivity);
router.post('/submit', authenticateToken, requireRole(['student']), ParticipationController.submitRegistration);
router.get('/suggest', authenticateToken, requireRole(['student']), ParticipationController.suggestActivities);

module.exports = router; 