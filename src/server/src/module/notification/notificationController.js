const db = require('../../models');
const Notification = db.Notification;
const User = db.User;
const Student = db.Student;
const Organizer = db.Organizer;
const { Op } = require('sequelize');

class NotificationController {
    // POST /notifications/send
    static async sendNotification(req, res) {
        try {
            const { fromUserID, toUserIDs, notificationTitle, notificationMessage } = req.body;
            const fromUser = await User.findByPk(fromUserID, {
                include: [{
                    model: Organizer,
                    as: 'organizer'
                }]
            });

            if (!fromUser) {
                return res.status(404).json({ message: 'Người gửi không tồn tại' });
            }

            let targetUsers = [];
            
            // Xử lý theo role của người gửi
            if (fromUser.role === 'admin') {
                // Admin có thể gửi cho tất cả
                if (toUserIDs === 'all_students') {
                    const students = await Student.findAll({
                        include: [{
                            model: User,
                            as: 'user'
                        }]
                    });
                    targetUsers = students.map(s => s.user.userID);
                } else if (toUserIDs === 'all_organizers') {
                    const organizers = await Organizer.findAll({
                        include: [{
                            model: User,
                            as: 'user'
                        }]
                    });
                    targetUsers = organizers.map(o => o.user.userID);
                } else {
                    targetUsers = Array.isArray(toUserIDs) ? toUserIDs : [toUserIDs];
                }
            } else if (fromUser.role === 'organizer') {
                // Organizer chỉ gửi cho sinh viên trong đơn vị của họ
                const organizer = fromUser.organizer;
                if (!organizer) {
                    return res.status(403).json({ message: 'Không có quyền gửi thông báo' });
                }

                const students = await Student.findAll({
                    where: { falculty: organizer.organizerUnit },
                    include: [{
                        model: User,
                        as: 'user'
                    }]
                });
                targetUsers = students.map(s => s.user.userID);
            } else {
                return res.status(403).json({ message: 'Không có quyền gửi thông báo' });
            }

            // Tạo thông báo cho từng người nhận
            const notifications = await Promise.all(
                targetUsers.map(toUserID =>
                    Notification.create({
                        fromUserID,
                        toUserID,
                        notificationTitle,
                        notificationMessage,
                        notificationStatus: 'unread'
                    })
                )
            );

            // Emit realtime notification
            req.io.emit('new_notification', {
                notifications: notifications.map(n => ({
                    notificationID: n.notificationID,
                    fromUserID: n.fromUserID,
                    toUserID: n.toUserID,
                    notificationTitle: n.notificationTitle,
                    notificationMessage: n.notificationMessage,
                    notificationStatus: n.notificationStatus,
                    createdAt: n.createdAt
                }))
            });

            res.status(201).json({
                message: 'Gửi thông báo thành công',
                notifications
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            res.status(500).json({ message: 'Lỗi server khi gửi thông báo' });
        }
    }

    // GET /notifications?userID=xxx
    static async getNotifications(req, res) {
        try {
            const { userID } = req.query;
            if (!userID) {
                return res.status(400).json({ message: 'Thiếu userID' });
            }

            const notifications = await Notification.findAll({
                where: { toUserID: userID },
                include: [{
                    model: User,
                    as: 'fromUser',
                    attributes: ['userID', 'name', 'role']
                }],
                order: [['createdAt', 'DESC']]
            });

            res.json({ notifications });
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy thông báo' });
        }
    }

    // PATCH /notifications/:id/read
    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const notification = await Notification.findByPk(id);
            
            if (!notification) {
                return res.status(404).json({ message: 'Không tìm thấy thông báo' });
            }

            await notification.update({ notificationStatus: 'read' });

            // Emit realtime update
            req.io.emit('notification_read', {
                notificationID: notification.notificationID,
                toUserID: notification.toUserID
            });

            res.json({ message: 'Đã đánh dấu đọc thông báo' });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ message: 'Lỗi server khi đánh dấu thông báo' });
        }
    }

    // GET /notifications/unread-count?userID=xxx
    static async getUnreadCount(req, res) {
        try {
            const { userID } = req.query;
            if (!userID) {
                return res.status(400).json({ message: 'Thiếu userID' });
            }

            const count = await Notification.count({
                where: {
                    toUserID: userID,
                    notificationStatus: 'unread'
                }
            });

            res.json({ unreadCount: count });
        } catch (error) {
            console.error('Error getting unread count:', error);
            res.status(500).json({ message: 'Lỗi server khi đếm thông báo chưa đọc' });
        }
    }
}

module.exports = NotificationController;
