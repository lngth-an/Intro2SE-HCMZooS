const express = require('express');
const router = express.Router();
const StudentController = require('../module/student/studentController');
const { authenticateToken, requireRole } = require('../module/auth/authMiddleware');
const { Student, User } = require('../models');
const { Op } = require('sequelize');

// Lấy thông tin sinh viên hiện tại
router.get('/me', authenticateToken, requireRole(['student']), StudentController.getMe);

// Lấy điểm rèn luyện
router.get('/score', authenticateToken, requireRole(['student']), StudentController.getScore);

router.get('/activities', StudentController.getActivities);

// Get student statistics
router.get('/stats', authenticateToken, requireRole(['student']), StudentController.getStats);

module.exports = router; 