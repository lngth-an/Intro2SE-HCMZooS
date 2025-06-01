const express = require('express');
const router = express.Router();
const StudentController = require('../module/student/studentController');
const { authenticateToken } = require('../module/auth/authMiddleware');

// Lấy thông tin sinh viên hiện tại
router.get('/me', StudentController.getMe);

router.get('/score', StudentController.getScore);
router.get('/activities', StudentController.getActivities);

// Get student statistics
router.get('/stats', authenticateToken, StudentController.getStats);

module.exports = router; 