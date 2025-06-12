// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const ActivityController = require('../module/activity/activityController');
const OrganizerController = require('../module/organizerController');
const ComplaintController = require('../module/complaint/complaintController');

// UC502: List activities (with filters, pagination, summary)
router.get('/', ActivityController.listActivities);
// Lấy tất cả hoạt động của organizer hiện tại
router.get('/organizer', ActivityController.getActivitiesByOrganizer);
// Route tìm kiếm hoạt động cho organizer
router.get('/manage', ActivityController.searchActivitiesForOrganizers);
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

// Các route quản lý đăng ký/điểm danh
router.get('/:activityID/registrations', ActivityController.getRegistrations);
router.patch('/:activityID/registrations/approve', ActivityController.approveRegistrations);
router.patch('/:activityID/attendance/confirm', ActivityController.confirmAttendance);

// Route lấy thông tin organizer
router.get('/organizer/me', OrganizerController.getMe);

// Các route quản lý khiếu nại
router.post('/complaint', ComplaintController.submitComplaint);
router.get('/complaint/organizer', ComplaintController.getComplaintsByOrganizer);
router.get('/complaint/:id', ComplaintController.getComplaintDetail);
router.patch('/complaint/:id', ComplaintController.updateComplaintStatus);

// Route cập nhật điểm rèn luyện
router.patch('/:activityID/training-point', ActivityController.updateTrainingPoint);

module.exports = router;