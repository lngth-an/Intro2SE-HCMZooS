// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const ActivityController = require('../module/activity/activityController');
const { authenticateToken, requireRole } = require('../module/auth/authMiddleware');

// UC502: List activities (with filters, pagination, summary)
router.get('/', authenticateToken, ActivityController.listActivities);
// Lấy tất cả hoạt động của organizer hiện tại
router.get('/organizer', ActivityController.getActivitiesByOrganizer);
// UC502: Get activity detail
router.get('/:id', ActivityController.getActivityDetail);
// UC501: Create activity
router.post('/', authenticateToken, requireRole(['organizer']), ActivityController.createActivity);
// UC501: Edit activity
router.put('/:id', authenticateToken, requireRole(['organizer']), ActivityController.updateActivity);
// UC501: Delete activity
router.delete('/:id', authenticateToken, requireRole(['organizer']), ActivityController.deleteActivity);
// UC501: Publish activity
router.patch('/:id/publish', ActivityController.publishActivity);
// UC501: Complete activity
router.patch('/:id/complete', ActivityController.completeActivity);
// UC501: Uncomplete activity
router.patch('/:id/uncomplete', ActivityController.uncompleteActivity);

// Các route quản lý đăng ký/điểm danh nếu còn dùng cho organizer
// router.get('/:activityId/registrations', ...);
// router.patch('/:activityId/registrations/approve', ...);
// router.patch('/:activityId/attendance/confirm', ...);

module.exports = router;