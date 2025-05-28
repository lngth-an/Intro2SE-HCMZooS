// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const ActivityController = require('../module/activity/activityController');

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

module.exports = router;