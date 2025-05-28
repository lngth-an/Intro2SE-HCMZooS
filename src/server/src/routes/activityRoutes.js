// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const ActivityController = require('../module/activity/activityController');
const ParticipationController = require('../module/activity/participationController');

// UC502: List activities (with filters, pagination, summary)
router.get('/', ActivityController.listActivities);
// UC502: Get activity detail
router.get('/:id', ActivityController.getActivityDetail);
// UC501: Create activity
router.post('/', ActivityController.createActivity);
// UC501: Edit activity
router.put('/:id', ActivityController.updateActivity);
// UC501: Delete activity
router.delete('/:id', ActivityController.deleteActivity);
// UC501: Publish activity
router.patch('/:id/publish', ActivityController.publishActivity);
// UC501: Complete activity
router.patch('/:id/complete', ActivityController.completeActivity);
// UC501: Uncomplete activity
router.patch('/:id/uncomplete', ActivityController.uncompleteActivity);

// Registration & Attendance management
router.get('/:activityId/registrations', ParticipationController.getRegistrations);
router.patch('/:activityId/registrations/approve', ParticipationController.approveRegistrations);
router.patch('/:activityId/attendance/confirm', ParticipationController.confirmAttendance);

module.exports = router;