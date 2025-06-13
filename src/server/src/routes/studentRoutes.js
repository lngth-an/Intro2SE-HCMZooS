const express = require('express');
const router = express.Router();
const StudentController = require('../module/student/studentController');
const { authenticateToken, requireRole } = require('../module/auth/authMiddleware');
const { Student, User } = require('../models');
const { Op } = require('sequelize');

// Lấy thông tin sinh viên hiện tại
router.get('/me', StudentController.getMe);

router.get('/score', StudentController.getScore);
router.get('/activities', StudentController.getActivities);

// Get student statistics
router.get('/stats', authenticateToken, StudentController.getStats);

// Thêm route mới vào participationRoutes.js
router.get('/activities/search', authenticateToken, StudentController.searchActivities);
module.exports = router; 