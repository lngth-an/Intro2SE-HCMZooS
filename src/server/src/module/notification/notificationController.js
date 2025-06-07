const db = require('../../models');
const Notification = db.Notification;
const User = db.User;
const Student = db.Student;
const Organizer = db.Organizer;
const Participation = db.Participation;
const Activity = db.Activity;
const { Op } = require('sequelize');

class NotificationController {
    // POST /notifications/send
    static async sendNotification(req, res) {
        try {
            const { fromUserID, toUserIDs, notificationTitle, notificationMessage } = req.body;
            
            console.log('Sending notification with params:', {
                fromUserID,
                toUserIDs,
                notificationTitle,
                notificationMessage
            });

            const fromUser = await User.findByPk(fromUserID, {
                include: [{
                    model: Organizer,
                    as: 'organizer'
                }]
            });

            if (!fromUser) {
                return res.status(404).json({ message: 'Người gửi không tồn tại' });
            }

            console.log('From user found:', {
                userID: fromUser.userID,
                role: fromUser.role,
                organizerID: fromUser.organizer?.organizerID
            });

            let targetUsers = [];

            // Xử lý theo role của người gửi
            if (fromUser.role === 'admin') {
                // Admin có thể gửi cho tất cả
                if (toUserIDs === 'all_students') {
                    const students = await Student.findAll({
                        include: [{
                            model: User,
                            as: 'user',
                            attributes: ['userID']
                        }]
                    });
                    targetUsers = students.map(s => s.user.userID);
                } else if (toUserIDs === 'all_organizers') {
                    const organizers = await Organizer.findAll({
                        include: [{
                            model: User,
                            as: 'user',
                            attributes: ['userID']
                        }]
                    });
                    targetUsers = organizers.map(o => o.user.userID);
                } else {
                    targetUsers = Array.isArray(toUserIDs) ? toUserIDs : [toUserIDs];
                }
            } else if (fromUser.role === 'organizer') {
                // Organizer chỉ gửi cho sinh viên từng tham gia hoạt động của họ
                const organizer = fromUser.organizer;
                if (!organizer) {
                    return res.status(403).json({ message: 'Không có quyền gửi thông báo' });
                }

                if (toUserIDs === 'all_students') {
                    const students = await Student.findAll({
                        include: [
                            {
                                model: User,
                                as: 'user',
                                attributes: ['userID']
                            },
                            {
                                model: Participation,
                                as: 'participations',
                                required: true,
                                include: [
                                    {
                                        model: Activity,
                                        as: 'activity',
                                        required: true,
                                        where: {
                                            organizerID: organizer.organizerID
                                        }
                                    }
                                ]
                            }
                        ],
                        distinct: true
                    });

                    targetUsers = students.map(s => s.user.userID);
                } else {
                    // Gửi riêng cho từng sinh viên, chỉ nếu sinh viên từng tham gia hoạt động của họ
                    const selectedStudents = await Student.findAll({
                        where: {
                            userID: {
                                [Op.in]: Array.isArray(toUserIDs) ? toUserIDs : [toUserIDs]
                            }
                        },
                        include: [
                            {
                                model: User,
                                as: 'user',
                                attributes: ['userID']
                            },
                            {
                                model: Participation,
                                as: 'participations',
                                required: true,
                                include: [
                                    {
                                        model: Activity,
                                        as: 'activity',
                                        required: true,
                                        where: {
                                            organizerID: organizer.organizerID
                                        }
                                    }
                                ]
                            }
                        ]
                    });

                    targetUsers = selectedStudents.map(s => s.user.userID);

                    if (targetUsers.length === 0) {
                        return res.status(403).json({
                            message: 'Không có sinh viên nào trong danh sách đã từng tham gia hoạt động của bạn'
                        });
                    }
                }
            } else {
                return res.status(403).json({ message: 'Không có quyền gửi thông báo' });
            }

            console.log('Target users found:', targetUsers);

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

            console.log('Notifications created:', notifications.length);

            // Emit realtime notification
            if (req.io) {
                req.io.emit('new_notification', {
                    notifications: notifications.map(n => ({
                        notificationID: n.notificationID,
                        fromUserID: n.fromUserID,
                        toUserID: n.toUserID,
                        notificationTitle: n.notificationTitle,
                        notificationMessage: n.notificationMessage,
                        notificationStatus: n.notificationStatus,
                    }))
                });
            }

            res.status(201).json({
                message: 'Gửi thông báo thành công',
                notifications,
                totalRecipients: targetUsers.length
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            res.status(500).json({ 
                message: 'Lỗi server khi gửi thông báo',
                error: error.message 
            });
        }
    }

    // GET /notifications/search
    static async searchStudents(req, res) {
        try {
            const { query } = req.query;
            const userID = req.user.userID;

            console.log('Search params:', { query, userID });

            const requestingUser = await User.findByPk(userID, {
                include: [{
                    model: Organizer,
                    as: 'organizer'
                }]
            });

            console.log('Requesting user:', {
                role: requestingUser?.role,
                organizerID: requestingUser?.organizer?.organizerID
            });

            if (!requestingUser) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            if (requestingUser.role === 'organizer' && requestingUser.organizer) {
                try {
                    // Tìm các sinh viên đã tham gia hoạt động của organizer
                    const participatingStudents = await Participation.findAll({
                        attributes: ['studentID'],
                        include: [{
                            model: Activity,
                            as: 'activity',
                            where: {
                                organizerID: requestingUser.organizer.organizerID
                            },
                            attributes: []
                        }],
                        group: ['studentID']
                    });

                    const studentIDs = participatingStudents.map(p => p.studentID);

                    // Tìm thông tin chi tiết của các sinh viên
                    const students = await Student.findAll({
                        where: {
                            [Op.and]: [
                                {
                                    studentID: {
                                        [Op.in]: studentIDs
                                    }
                                },
                                query ? {
                                    [Op.or]: [
                                        { studentID: query },
                                        { '$user.name$': { [Op.iLike]: `%${query}%` } },
                                        { '$user.email$': { [Op.iLike]: `%${query}%` } }
                                    ]
                                } : {}
                            ]
                        },
                        include: [{
                            model: User,
                            as: 'user',
                            attributes: ['userID', 'name', 'email', 'phone']
                        }],
                        limit: 10
                    });

                    console.log('Found students count:', students.length);
                    res.json({ students });
                } catch (error) {
                    console.error('Error in organizer search:', error);
                    throw error;
                }
            } else if (requestingUser.role === 'admin') {
                try {
                    const students = await Student.findAll({
                        where: query ? {
                            [Op.or]: [
                                { studentID: query },
                                { '$user.name$': { [Op.iLike]: `%${query}%` } },
                                { '$user.email$': { [Op.iLike]: `%${query}%` } }
                            ]
                        } : {},
                        include: [{
                            model: User,
                            as: 'user',
                            attributes: ['userID', 'name', 'email', 'phone']
                        }],
                        limit: 10
                    });

                    console.log('Found students count:', students.length);
                    res.json({ students });
                } catch (error) {
                    console.error('Error in admin search:', error);
                    throw error;
                }
            } else {
                return res.status(403).json({ message: 'Không có quyền tìm kiếm sinh viên' });
            }
        } catch (error) {
            console.error('Error searching students:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            res.status(500).json({ 
                message: 'Lỗi server khi tìm kiếm sinh viên',
                error: error.message 
            });
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
                }]
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

    // GET /notifications/unread-count
    static async getUnreadCount(req, res) {
        try {
            const userID = req.user.userID;
            
            const count = await Notification.count({
                where: {
                    toUserID: userID,
                    notificationStatus: 'unread'
                }
            });

            res.json({ count });
        } catch (error) {
            console.error('Error getting unread count:', error);
            res.status(500).json({ 
                message: 'Lỗi server khi lấy số lượng thông báo chưa đọc',
                error: error.message 
            });
        }
    }
}

module.exports = NotificationController;
