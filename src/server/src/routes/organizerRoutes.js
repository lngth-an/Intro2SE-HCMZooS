const express = require('express');
const router = express.Router();
const { getMe, updateMe, getStats } = require('../module/organizer/organizerController');
const { authenticateToken } = require('../module/auth/authMiddleware');

// GET /organizer/me - Lấy thông tin organizer
router.get('/me', authenticateToken, getMe);

// PATCH /organizer/me - Cập nhật thông tin organizer
router.patch('/me', authenticateToken, updateMe);

// GET /organizer/stats - Lấy thống kê
router.get('/stats', authenticateToken, getStats);

module.exports = router; 