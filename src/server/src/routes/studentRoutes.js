const express = require('express');
const router = express.Router();
const StudentController = require('../module/student/studentController');

// Lấy thông tin sinh viên hiện tại
router.get('/me', StudentController.getMe);

module.exports = router; 