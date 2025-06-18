console.log('=== ACTIVITY ROUTES LOADED ===');
// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const ActivityController = require('../module/activity/activityController');
const OrganizerController = require('../module/organizerController');
const ComplaintController = require('../module/complaint/complaintController');
const { authenticateToken, requireRole } = require('../module/auth/authMiddleware');

// Route lấy hoạt động chưa đăng ký cho student (phải đặt trước route động)
router.get('/available-for-student', authenticateToken, ActivityController.getAvailableActivitiesForStudent);

// Các route cho organizer
router.get('/organizer', authenticateToken, requireRole(['organizer']), ActivityController.getActivitiesByOrganizer);
router.get('/manage', authenticateToken, requireRole(['organizer']), ActivityController.searchActivitiesForOrganizers);
router.post('/', authenticateToken, requireRole(['organizer']), ActivityController.createActivity);
router.put('/:id', authenticateToken, requireRole(['organizer']), ActivityController.updateActivity);
router.delete('/:id', authenticateToken, requireRole(['organizer']), ActivityController.deleteActivity);
router.patch('/:id/publish', authenticateToken, requireRole(['organizer']), ActivityController.publishActivity);
router.patch('/:id/complete', authenticateToken, requireRole(['organizer']), ActivityController.completeActivity);
router.patch('/:id/uncomplete', authenticateToken, requireRole(['organizer']), ActivityController.uncompleteActivity);
router.get('/:activityID/registrations', authenticateToken, requireRole(['organizer']), ActivityController.getRegistrations);
router.patch('/:activityID/registrations/approve', authenticateToken, requireRole(['organizer']), ActivityController.approveRegistrations);
router.patch('/:activityID/attendance/confirm', authenticateToken, requireRole(['organizer']), ActivityController.confirmAttendance);
router.get('/organizer/me', authenticateToken, requireRole(['organizer']), OrganizerController.getMe);
router.post('/complaint', authenticateToken, requireRole(['organizer']), ComplaintController.submitComplaint);
router.get('/complaint/organizer', authenticateToken, requireRole(['organizer']), ComplaintController.getComplaintsByOrganizer);
router.get('/complaint/:id', authenticateToken, requireRole(['organizer']), ComplaintController.getComplaintDetail);
router.patch('/complaint/:id', authenticateToken, requireRole(['organizer']), ComplaintController.updateComplaintStatus);
router.patch('/:activityID/training-point', authenticateToken, requireRole(['organizer']), ActivityController.updateTrainingPoint);
router.get('/:activityID/search-student', authenticateToken, requireRole(['organizer']), ActivityController.searchStudentInActivity);
// Route động phải đặt sau cùng
router.get('/:id', authenticateToken, requireRole(['organizer']), ActivityController.getActivityDetail);

module.exports = router;