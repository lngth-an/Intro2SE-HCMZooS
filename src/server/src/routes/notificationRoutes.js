const express = require('express');
const router = express.Router();
const NotificationController = require('../module/notification/notificationController');
const { authenticateToken } = require('../module/auth/authMiddleware');

// Gửi thông báo
router.post('/send', authenticateToken, NotificationController.sendNotification);

// Lấy danh sách thông báo
router.get('/', authenticateToken, NotificationController.getNotifications);

// Lấy danh sách thông báo đã gửi
router.get('/sent', authenticateToken, NotificationController.getSentNotifications);

// Đánh dấu thông báo đã đọc
router.patch('/:id/read', authenticateToken, NotificationController.markAsRead);

// Lấy số lượng thông báo chưa đọc
router.get('/unread/count', authenticateToken, NotificationController.getUnreadCount);

// Tìm kiếm sinh viên
router.get('/search', authenticateToken, NotificationController.searchStudents);

module.exports = router; 