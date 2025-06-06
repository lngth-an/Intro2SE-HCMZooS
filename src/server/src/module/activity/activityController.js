const ActivityModel = require('./activityModel');
const db = require('../../models');

class ActivityController {
    // Helper: Get organizerID from req.user.userID
    static async getOrganizerID(userID) {
        const organizer = await db.Organizer.findOne({ where: { userID } });
        return organizer ? organizer.organizerID : null;
    }

    // UC501: Create new activity (status = draft)
    static async createActivity(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can create activities.' });
            }
            const { name, eventStart, location } = req.body;
            if (!name || !eventStart || !location) {
                return res.status(400).json({ message: 'Missing required fields: name, eventStart, location.' });
            }
            const organizerID = await ActivityController.getOrganizerID(req.user.userID);
            if (!organizerID) {
                return res.status(403).json({ message: 'Organizer profile not found.' });
            }
            const activity = await ActivityModel.createActivity({
                ...req.body,
                organizerID,
                activityStatus: 'draft',
            });

            console.log('✅ Activity vừa tạo:', activity);

            res.status(201).json(activity);
        } catch (error) {
            console.error('Error creating activity:', error);
            res.status(500).json({ message: 'Error creating activity.' });
        }
    }

    // UC501: Edit activity if draft and owned by user
    static async updateActivity(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can edit activities.' });
            }
            const { id } = req.params;
            const organizerID = await ActivityController.getOrganizerID(req.user.userID);
            const activity = await ActivityModel.getActivityById(id, organizerID);
            if (!activity) {
                return res.status(404).json({ message: 'Activity not found or not owned by user.' });
            }
            if (activity.activityStatus !== 'draft') {
                return res.status(400).json({ message: 'Only draft activities can be edited.' });
            }
            const { name, eventStart, location } = req.body;
            if (!name || !eventStart || !location) {
                return res.status(400).json({ message: 'Missing required fields: name, eventStart, location.' });
            }
            await ActivityModel.updateActivity(id, organizerID, req.body);
            const updated = await ActivityModel.getActivityById(id, organizerID);
            res.status(200).json(updated);
        } catch (error) {
            console.error('Error updating activity:', error);
            res.status(500).json({ message: 'Error updating activity.' });
        }
    }

    // UC501: Delete activity if draft and owned by user
    static async deleteActivity(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can delete activities.' });
            }
            const { id } = req.params;
            const organizerID = await ActivityController.getOrganizerID(req.user.userID);
            const activity = await ActivityModel.getActivityById(id, organizerID);
            if (!activity) {
                return res.status(404).json({ message: 'Activity not found or not owned by user.' });
            }
            if (activity.activityStatus !== 'draft') {
                return res.status(400).json({ message: 'Only draft activities can be deleted.' });
            }
            await ActivityModel.deleteActivity(id, organizerID);
            res.status(200).json({ message: 'Activity deleted successfully.' });
        } catch (error) {
            console.error('Error deleting activity:', error);
            res.status(500).json({ message: 'Error deleting activity.' });
        }
    }

    // UC501: Publish activity (change status from draft to published)
    static async publishActivity(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can publish activities.' });
            }
            const { id } = req.params;
            const organizerID = await ActivityController.getOrganizerID(req.user.userID);
            const activity = await ActivityModel.getActivityById(id, organizerID);
            if (!activity) {
                return res.status(404).json({ message: 'Activity not found or not owned by user.' });
            }
            if (activity.activityStatus !== 'draft') {
                return res.status(400).json({ message: 'Only draft activities can be published.' });
            }
            await ActivityModel.publishActivity(id, organizerID);
            const published = await ActivityModel.getActivityById(id, organizerID);
            res.status(200).json(published);
        } catch (error) {
            console.error('Error publishing activity:', error);
            res.status(500).json({ message: 'Error publishing activity.' });
        }
    }

    // UC502: List activities with filters, pagination, and summary
    static async listActivities(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can view their activities.' });
            }
            const organizerID = await ActivityController.getOrganizerID(req.user.userID);
            console.log('organizerID:', organizerID);
            if (!organizerID) {
                return res.status(403).json({ message: 'Organizer profile not found.' });
            }
            const { status, keyword, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
            const filters = { status, keyword, dateFrom, dateTo };
            const pagination = { page, limit };
            const { rows, count } = await ActivityModel.listActivities(organizerID, filters, pagination);
            // Summary metrics
            const draftCount = await ActivityModel.countByStatus(organizerID, 'draft');
            const publishedCount = await ActivityModel.countByStatus(organizerID, 'published');
            if (rows.length === 0) {
                return res.status(200).json({ message: 'Không có hoạt động nào', total: 0, draftCount, publishedCount, activities: [] });
            }
            res.status(200).json({
                total: count,
                draftCount,
                publishedCount,
                activities: rows,
            });
        } catch (error) {
            console.error('Error listing activities:', error);
            res.status(500).json({ message: 'Error listing activities.' });
        }
    }

    // UC502: Get activity details if owned by user
    static async getActivityDetail(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can view activity details.' });
            }
            const { id } = req.params;
            const organizerID = await ActivityController.getOrganizerID(req.user.userID);
            const activity = await ActivityModel.getActivityById(id, organizerID);
            if (!activity) {
                return res.status(404).json({ message: 'Activity not found or not owned by user.' });
            }
            res.status(200).json(activity);
        } catch (error) {
            console.error('Error getting activity detail:', error);
            res.status(500).json({ message: 'Error getting activity detail.' });
        }
    }

    // PATCH /activity/:id/complete
    static async completeActivity(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can complete activities.' });
            }
            const { id } = req.params;
            const organizerID = await ActivityController.getOrganizerID(req.user.userID);
            const activity = await db.Activity.findOne({ where: { activityID: id, organizerID } });
            if (!activity) {
                return res.status(404).json({ message: 'Activity not found or not owned by user.' });
            }
            if (activity.activityStatus !== 'published') {
                return res.status(400).json({ message: 'Only published activities can be completed.' });
            }
            activity.activityStatus = 'completed';
            await activity.save();
            res.status(200).json(activity);
        } catch (error) {
            console.error('Error completing activity:', error);
            res.status(500).json({ message: 'Error completing activity.' });
        }
    }

    // PATCH /activity/:id/uncomplete
    static async uncompleteActivity(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can uncomplete activities.' });
            }
            const { id } = req.params;
            const organizerID = await ActivityController.getOrganizerID(req.user.userID);
            const activity = await db.Activity.findOne({ where: { activityID: id, organizerID } });
            if (!activity) {
                return res.status(404).json({ message: 'Activity not found or not owned by user.' });
            }
            if (activity.activityStatus !== 'completed') {
                return res.status(400).json({ message: 'Only completed activities can be uncompleted.' });
            }
            activity.activityStatus = 'published';
            await activity.save();
            res.status(200).json(activity);
        } catch (error) {
            console.error('Error uncompleting activity:', error);
            res.status(500).json({ message: 'Error uncompleting activity.' });
        }
    }

    // GET /activity/organizer - Lấy tất cả hoạt động của organizer hiện tại
    static async getActivitiesByOrganizer(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can view their activities.' });
            }
            const organizerID = await ActivityController.getOrganizerID(req.user.userID);
            if (!organizerID) {
                return res.status(403).json({ message: 'Organizer profile not found.' });
            }
            const activities = await db.Activity.findAll({
                where: { organizerID },
                order: [['eventStart', 'DESC']],
            });
            res.status(200).json({ activities });
        } catch (error) {
            console.error('Error fetching organizer activities:', error);
            res.status(500).json({ message: 'Error fetching organizer activities.' });
        }
    }

    // Lấy danh sách đăng ký/tham gia cho organizer
    static async getRegistrations(req, res) {
        try {
            const { activityID } = req.params;
            let { status, search, sort = 'createdAt', order = 'asc' } = req.query;
            // Kiểm tra quyền sở hữu
            const activity = await db.Activity.findByPk(activityID);
            if (!activity) return res.status(404).json({ message: 'Activity not found' });
            if (req.user.role !== 'organizer' || activity.organizerID !== await ActivityController.getOrganizerID(req.user.userID)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            // Build where clause
            const where = { activityID };
            if (status) where.participationStatus = status;
            // Join student + user
            const include = [{
                model: db.Student,
                as: 'student',
                include: [{ model: db.User, as: 'user', attributes: ['name'] }]
            }];
            if (search) {
                include[0].where = {
                    [db.Sequelize.Op.or]: [
                        { studentID: { [db.Sequelize.Op.iLike]: `%${search}%` } },
                        { '$student.user.name$': { [db.Sequelize.Op.iLike]: `%${search}%` } }
                    ]
                };
            }
            // Nếu sort là createdAt (không cột này), đổi thành participationID
            if (sort === 'createdAt') sort = 'participationID';
            const regs = await db.Participation.findAll({
                where,
                include,
                order: [[sort, order]],
            });
            res.json({ registrations: regs.map(p => ({
                participationID: p.participationID,
                studentID: p.studentID,
                studentName: p.student?.user?.name,
                academicYear: p.student?.academicYear,
                faculty: p.student?.falculty,
                status: p.participationStatus,
                registrationTime: p.createdAt,
            })) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching registrations' });
        }
    }

    // Duyệt hoặc từ chối đăng ký (bulk)
    static async approveRegistrations(req, res) {
        try {
            const { activityID } = req.params;
            const { participationIDs, action } = req.body; // action: 'approve' | 'reject' | 'pending'
            // Kiểm tra quyền sở hữu
            const activity = await db.Activity.findByPk(activityID);
            if (!activity) return res.status(404).json({ message: 'Activity not found' });
            if (req.user.role !== 'organizer' || activity.organizerID !== await ActivityController.getOrganizerID(req.user.userID)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            // Lọc các participationID hợp lệ theo action
            const participations = await db.Participation.findAll({
                where: { activityID, participationID: participationIDs }
            });
            let idsToUpdate = [];
            if (action === 'approve') {
                idsToUpdate = participations.filter(p => p.participationStatus !== 'approved').map(p => p.participationID);
            } else if (action === 'pending') {
                idsToUpdate = participations.filter(p => p.participationStatus === 'approved').map(p => p.participationID);
            } else if (action === 'reject') {
                idsToUpdate = participationIDs;
            }
            if (idsToUpdate.length > 0) {
                await db.Participation.update(
                    { participationStatus: action === 'approve' ? 'approved' : action === 'pending' ? 'pending' : 'rejected' },
                    { where: { activityID, participationID: idsToUpdate } }
                );
            }
            // TODO: Gửi notification cho sinh viên
            res.json({ success: true, updated: idsToUpdate.length });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error approving registrations' });
        }
    }

    // Xác nhận tham gia (bulk)
    static async confirmAttendance(req, res) {
        try {
            const { activityID } = req.params;
            const { participationIDs, status } = req.body; // status: 'present' | 'absent'
            // Kiểm tra quyền sở hữu
            const activity = await db.Activity.findByPk(activityID);
            if (!activity) return res.status(404).json({ message: 'Activity not found' });
            if (req.user.role !== 'organizer' || activity.organizerID !== await ActivityController.getOrganizerID(req.user.userID)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            await db.Participation.update(
                { participationStatus: status },
                { where: { activityID, participationID: participationIDs } }
            );
            // TODO: Cập nhật điểm rèn luyện nếu cần
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error confirming attendance' });
        }
    }

    // PATCH /activity/:activityID/training-point
    static async updateTrainingPoint(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden' });
            }
            const { activityID } = req.params;
            const { participationID, newPoint, reason } = req.body;
            console.log('updateTrainingPoint req.body:', req.body);
            if (!participationID || isNaN(newPoint) || !reason || !reason.trim()) {
                return res.status(400).json({ message: 'Missing or invalid input.' });
            }
            if (newPoint < 0 || newPoint > 100) {
                return res.status(400).json({ message: 'Training point must be between 0 and 100.' });
            }
            // Tìm participation chỉ theo participationID
            const participation = await db.Participation.findOne({ where: { participationID } });
            if (!participation) return res.status(404).json({ message: 'Participation not found.' });

            const activity = await db.Activity.findOne({ where: { activityID: participation.activityID, organizerID: req.user.organizerID } });
            if (!activity) return res.status(403).json({ message: 'You do not manage this activity.' });
            
            // Check deadline (eventEnd + 7 days)
            const deadline = new Date(activity.eventEnd);
            deadline.setDate(deadline.getDate() + 7);
            if (new Date() > deadline) {
                return res.status(400).json({ message: 'Cannot update after deadline.' });
            }
            // Cập nhật điểm
            participation.trainingPoint = newPoint;
            await participation.save();
            res.json({ message: 'Training point updated successfully.' });
        } catch (err) {
            console.error('Error in updateTrainingPoint:', err);
            res.status(500).json({ message: 'Error updating training point.' });
        }
    }
}

module.exports = ActivityController;