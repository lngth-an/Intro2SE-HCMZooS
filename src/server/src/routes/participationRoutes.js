const express = require('express');
const router = express.Router();
const ParticipationController = require('../module/participation/participationController');
const { authenticateToken } = require('../module/auth/authMiddleware');

router.get('/open', ParticipationController.getOpenActivities);
router.get('/check-eligibility/:activityID', ParticipationController.checkEligibility);
router.get('/check-registration/:activityID', ParticipationController.checkRegistration);
router.post('/register', ParticipationController.registerActivity);
router.post('/submit', ParticipationController.submitRegistration);
router.get('/suggest', ParticipationController.suggestActivities);
router.delete('/:participationID', ParticipationController.cancelRegistration);
router.post('/delete-draft', ParticipationController.deleteDraft);
router.get('/mine', authenticateToken, ParticipationController.getMyParticipations);
module.exports = router; 