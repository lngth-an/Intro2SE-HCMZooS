const express = require('express');
const router = express.Router();
const ParticipationController = require('../module/participation/participationController');

router.get('/open', ParticipationController.getOpenActivities);
router.get('/check-eligibility/:activityID', ParticipationController.checkEligibility);
router.post('/register', ParticipationController.registerActivity);
router.post('/submit', ParticipationController.submitRegistration);
router.get('/suggest', ParticipationController.suggestActivities);

module.exports = router; 