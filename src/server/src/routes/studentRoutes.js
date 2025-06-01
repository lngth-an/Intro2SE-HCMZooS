const express = require('express');
const router = express.Router();
const StudentController = require('../module/student/studentController');

// Lấy thông tin sinh viên hiện tại
router.get('/me', StudentController.getMe);

router.get('/score', StudentController.getScore);
router.get('/activities', StudentController.getActivities);

module.exports = router; 