const express = require('express');
const router = express.Router();
const StudentController = require('../module/student/studentController');
const { authenticateToken, requireRole } = require('../module/auth/authMiddleware');
const ComplaintController = require('../module/complaint/complaintController');
const { Student, User } = require('../models');
const { Op } = require('sequelize');

// Lấy thông tin sinh viên hiện tại
router.get('/me', StudentController.getMe);

// Route khiếu nại điểm rèn luyện
router.post('/complaint', authenticateToken, ComplaintController.submitComplaint);

router.get('/score', StudentController.getScore);
router.get('/activities', StudentController.getActivities);

// Get student statistics
router.get('/stats', authenticateToken, StudentController.getStats);

router.get('/activities/search', authenticateToken, StudentController.searchActivities);
module.exports = router; 