const ActivityModel = require('./activityModel');
const db = require('../../models');
const { Op } = require('sequelize');
const Activity = db.Activity;
const Organizer = db.Organizer;
const User = db.User;
const Student = db.Student;
const Participation = db.Participation;
const Semester = db.Semester;
const pool = require('../../config/database');

class ActivityController {
    // Helper: Get organizerID from req.user.userID
    static async getOrganizerID(userID) {
        const organizer = await db.Organizer.findOne({ where: { userID } });
        return organizer ? organizer.organizerID : null;
    }

    // Get activities for current organizer
    static async getOrganizerActivities(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can access this endpoint.' });
            }

            const organizerID = await ActivityController.getOrganizerID(req.user.userID);
            if (!organizerID) {
                return res.status(404).json({ message: 'Organizer not found' });
            }

            const activities = await ActivityModel.getActivitiesByOrganizer(organizerID);
            res.json({ activities });
        } catch (error) {
            console.error('Error fetching organizer activities:', error);
            res.status(500).json({ message: 'Error fetching organizer activities.' });
        }
    }

    // UC501: Create new activity (status = draft)
    static async createActivity(req, res) {
        console.log('User info:', req.user);
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
                activityStatus: 'Bản nháp',
            });

            console.log(' Activity vừa tạo:', activity);

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
            if (activity.activityStatus !== 'Bản nháp') {
                return res.status(400).json({ message: 'Chỉ có thể chỉnh sửa hoạt động ở trạng thái Bản nháp.' });
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
            if (activity.activityStatus !== 'Bản nháp') {
                return res.status(400).json({ message: 'Chỉ có thể xóa hoạt động ở trạng thái Bản nháp.' });
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
            if (activity.activityStatus !== 'Bản nháp') {
                return res.status(400).json({ message: 'Chỉ có thể đăng tải hoạt động ở trạng thái Bản nháp.' });
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
            const draftCount = await ActivityModel.countByStatus(organizerID, 'Bản nháp');
            const publishedCount = await ActivityModel.countByStatus(organizerID, 'Đã đăng tải');
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
            if (activity.activityStatus !== 'Đã đăng tải') {
                return res.status(400).json({ message: 'Chỉ những hoạt động đã đăng tải mới có thể hoàn thành.' });
            }
            activity.activityStatus = 'Đã hoàn thành';
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
            if (activity.activityStatus !== 'Đã hoàn thành') {
                return res.status(400).json({ message: 'Only completed activities can be uncompleted.' });
            }
            activity.activityStatus = 'Đã đăng tải';
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
            if (action === 'Đã duyệt') {
                idsToUpdate = participations.filter(p => p.participationStatus !== 'Đã duyệt').map(p => p.participationID);
            } else if (action === 'Chờ duyệt') {
                idsToUpdate = participations.filter(p => p.participationStatus === 'Đã duyệt').map(p => p.participationID);
            } else if (action === 'Từ chối') {
                idsToUpdate = participationIDs;
            }
            if (idsToUpdate.length > 0) {
                await db.Participation.update(
                    { participationStatus: action === 'Đã duyệt' ? 'Đã duyệt' : action === 'Chờ duyệt' ? 'Chờ duyệt' : 'Từ chối' },
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
            const { participationIDs, status } = req.body; // status: 'Đã tham gia' | 'Vắng'
            
            // Kiểm tra quyền sở hữu
            const activity = await db.Activity.findByPk(activityID);
            if (!activity) return res.status(404).json({ message: 'Activity not found' });
            if (req.user.role !== 'organizer' || activity.organizerID !== await ActivityController.getOrganizerID(req.user.userID)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            // Cập nhật trạng thái tham gia
            const newStatus = status === 'Đã tham gia' ? 'Đã tham gia' : 'Vắng';

            // Lấy điểm mặc định dựa trên loại hoạt động
            let defaultPoint = 3; // Điểm mặc định cho loại "Khác"
            switch (activity.type) {
                case 'Học thuật':
                    defaultPoint = 10;
                    break;
                case 'Tình nguyện':
                    defaultPoint = 8;
                    break;
                case 'Thể thao':
                case 'Nghệ thuật':
                case 'Hội thảo':
                    defaultPoint = 5;
                    break;
                case 'Kỹ năng':
                    defaultPoint = 10;
                    break;
                default:
                    defaultPoint = 3; // Loại "Khác"
                    break;
            }

            await db.Participation.update(
                { 
                    participationStatus: newStatus,
                    // Nếu có mặt, cập nhật điểm rèn luyện theo loại hoạt động, nếu vắng thì 0
                    trainingPoint: status === 'Đã tham gia' ? defaultPoint : 0
                },
                { where: { activityID, participationID: participationIDs } }
            );

            res.json({ 
                success: true,
                message: `Đã cập nhật ${participationIDs.length} sinh viên thành ${newStatus}`,
                defaultPoint
            });
        } catch (err) {
            console.error('Error in confirmAttendance:', err);
            res.status(500).json({ message: 'Error confirming attendance' });
        }
    }

    // PATCH /activity/:activityID/training-point
    static async updateTrainingPoint(req, res) {
        try {
            // Kiểm tra xác thực và quyền
            if (!req.user) {
                return res.status(401).json({ error: 'Chưa đăng nhập' });
            }
    
            if (req.user.role !== 'organizer') {
                return res.status(403).json({ error: 'Chỉ ban tổ chức mới có quyền cập nhật điểm' });
            }
    
            const { participationID, newPoint, reason } = req.body;
            const userID = req.user.userID;
    
            // Lấy organizerID từ bảng organizers dựa trên userID
            const organizer = await db.Organizer.findOne({ where: { userID } });
    
            if (!organizer) {
                return res.status(403).json({ error: 'Không tìm thấy thông tin ban tổ chức tương ứng với người dùng.' });
            }
    
            const organizerID = organizer.organizerID;
    
            // Tìm participation và activity
            const participation = await db.Participation.findByPk(participationID, {
                include: [{
                    model: db.Activity,
                    as: 'activity'
                }]
            });
    
            if (!participation) {
                return res.status(404).json({ error: 'Không tìm thấy đăng ký.' });
            }
    
            // Kiểm tra quyền cập nhật
            if (participation.activity.organizerID !== organizerID) {
                return res.status(403).json({
                    error: 'Bạn không có quyền cập nhật điểm cho đăng ký này.',
                    details: {
                        userOrganizerID: organizerID,
                        activityOrganizerID: participation.activity.organizerID
                    }
                });
            }
    
            // Cập nhật điểm rèn luyện
            await participation.update({ trainingPoint: newPoint });
    
            // (Tuỳ chọn) Ghi log ra console hoặc frontend gửi lý do nếu cần
            console.log(`Organizer ${organizerID} updated participation ${participationID} to ${newPoint} điểm. Lý do: ${reason}`);
    
            res.json({
                message: 'Cập nhật điểm rèn luyện thành công',
                participation: {
                    ...participation.toJSON(),
                    trainingPoint: newPoint
                }
            });
        } catch (err) {
            console.error('Error in updateTrainingPoint:', err);
            res.status(500).json({ error: 'Lỗi khi cập nhật điểm rèn luyện' });
        }
    }
    

    /* ------------------------------------------------------------------
       GET /api/activities/manage  - dành cho organizer
    -------------------------------------------------------------------*/
    static searchActivitiesForOrganizers = async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can access this endpoint.' });
            }
    
            const {
                q = '',
                status,
                dateRange,
                isApproved,
                sortBy = 'registrationStart',
                sortOrder = 'desc',
                page = 1,
                limit = 10
            } = req.query;
    
            const offset = (page - 1) * limit;
    
            // Tìm organizerID từ userID
            const organizer = await db.Organizer.findOne({
                where: { userID: req.user.userID }
            });
    
            if (!organizer) {
                return res.status(404).json({ message: 'Organizer not found' });
            }
    
            // Xây dựng điều kiện tìm kiếm
            const where = {
                organizerID: organizer.organizerID
            };
    
            if (q) {
                where.name = {
                    [Op.iLike]: `%${q}%`
                };
            }
    
            if (dateRange) {
                const [startDate, endDate] = dateRange.split(',');
                if (startDate) {
                    where.registrationStart = {
                        [Op.gte]: startDate
                    };
                }
                if (endDate) {
                    where.registrationStart = {
                        ...(where.registrationStart || {}),
                        [Op.lte]: endDate
                    };
                }
            }
    
            // Xác định thứ tự sắp xếp
            const order = [];
            if (sortBy === 'registrations') {
                order.push([db.sequelize.literal('"registrationCount"'), sortOrder.toUpperCase()]);
            } else {
                order.push([sortBy, sortOrder.toUpperCase()]);
            }
    
            const activityAttributes = Object.keys(db.Activity.rawAttributes);
            const groupByAttributes = activityAttributes.map(attr => `Activity.${attr}`);
    
    
            // Thực hiện query
            const { rows: activities, count: total } = await db.Activity.findAndCountAll({
                where,
                include: [
                    {
                        model: db.Participation,
                        as: 'participations',
                        attributes: [],
                        required: false,
                        ...(isApproved && {
                            where: {
                                participationStatus: isApproved
                            }
                        })
                    }
                ],
                attributes: {
                    include: [
                        ...activityAttributes,
                        [
                            db.sequelize.literal('COUNT(DISTINCT "participations"."participationID")'),
                            'registrationCount'
                        ],
                        [
                            db.sequelize.literal('COUNT(DISTINCT CASE WHEN "participations"."participationStatus" = \'Đã duyệt\' THEN "participations"."participationID" END)'),
                            'approvedCount'
                        ],
                        [
                            db.sequelize.literal('COALESCE(AVG("participations"."trainingPoint"), 0)'),
                            'averageTrainingPoint'
                        ]
                    ]
                },
                group: ['Activity.activityID', ...groupByAttributes],
                order,
                limit: parseInt(limit),
                offset: parseInt(offset),
                subQuery: false
            });
    
            const totalActivities = activities.length > 0 ? activities.length : 0;
    
            res.json({
                activities,
                total: totalActivities,
                page: parseInt(page),
                limit: parseInt(limit)
            });
    
        } catch (error) {
            console.error('Error searching activities:', error);
            res.status(500).json({
                    message: 'Error searching activities',
                    error: error.message
                });
        }
    }

    // Tìm kiếm sinh viên theo studentID trong hoạt động
    static async searchStudentInActivity(req, res) {
        try {
            if (!req.user || req.user.role !== 'organizer') {
                return res.status(403).json({ message: 'Forbidden: Only organizers can search students.' });
            }
    
            const { activityID } = req.params;
            const { studentID } = req.query;
    
            if (!studentID) {
                return res.status(400).json({ message: 'Mã số sinh viên là bắt buộc.' });
            }
    
            // Lấy organizerID từ user hiện tại
            const organizerID = await ActivityController.getOrganizerID(req.user.userID);
            if (!organizerID) {
                return res.status(404).json({ message: 'Organizer not found' });
            }
    
            // Kiểm tra hoạt động có thuộc organizer không
            const activity = await Activity.findOne({
                where: { activityID, organizerID }
            });
    
            if (!activity) {
                return res.status(404).json({ message: 'Không tìm thấy hoạt động hoặc bạn không có quyền truy cập.' });
            }
    
            // Tìm sinh viên trong danh sách đã đăng ký hoặc đã tham gia của hoạt động
            console.log('Searching for student:', {
                studentID,
                activityID,
                conditions: {
                    participationStatus: ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã tham gia', 'Vắng']
                }
            });

            const student = await Student.findOne({
                where: { studentID },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['name', 'email', 'phone', 'role']
                    },
                    {
                        model: Participation,
                        as: 'participations',
                        where: {
                            activityID,
                            participationStatus: {
                                [Op.in]: ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã tham gia', 'Vắng']
                            }
                        },
                        required: true,
                        attributes: ['participationID', 'participationStatus', 'trainingPoint'],
                        include: [
                            {
                                model: Activity,
                                as: 'activity',
                                attributes: ['type']
                            }
                        ]
                    }
                ],
                attributes: ['studentID', 'userID', 'sex', 'dateOfBirth', 'academicYear', 'falculty', 'point']
            });

            console.log('Student search result:', student ? {
                studentID: student.studentID,
                hasParticipations: student.participations?.length > 0,
                participationStatus: student.participations?.[0]?.participationStatus
            } : 'Not found');

            if (!student) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy sinh viên có mã số này trong danh sách đăng ký/tham gia của hoạt động.',
                    found: false
                });
            }
    
            const p = student.participations[0]; // chắc chắn có ít nhất 1 vì required: true
    
            const response = {
                found: true,
                student: {
                    studentID: student.studentID,
                    userID: student.userID,
                    name: student.user.name,
                    email: student.user.email,
                    phone: student.user.phone,
                    sex: student.sex,
                    dateOfBirth: student.dateOfBirth,
                    academicYear: student.academicYear,
                    faculty: student.falculty,
                    point: student.point,
                    participation: {
                        participationID: p.participationID,
                        status: p.participationStatus,
                        trainingPoint: p.trainingPoint,
                        type: p.activity?.type || null // lấy loại hoạt động
                    },
                    participationStatusText: p.participationStatus === 'Đã duyệt'
                        ? 'Đã tham gia'
                        : p.participationStatus === 'Chờ duyệt'
                        ? 'Đang chờ duyệt'
                        : p.participationStatus === 'Từ chối'
                        ? 'Đã từ chối'
                        : p.participationStatus === 'Đã tham gia'
                        ? 'Đã tham gia'
                        : p.participationStatus === 'Vắng'
                        ? 'Vắng mặt'
                        : p.participationStatus
                }
            };
    
            res.status(200).json(response);
        } catch (error) {
            console.error('Error searching student in activity:', error);
            res.status(500).json({ message: 'Lỗi khi tìm kiếm sinh viên.' });
        }
    }    

    // GET /activity/available-for-student
    static async getAvailableActivitiesForStudent(req, res) {
        try {
            if (!req.user || req.user.role !== 'student') {
                return res.status(403).json({ message: 'Forbidden: Only students can view available activities.' });
            }
            const studentID = req.user.studentID;
            // Lấy tất cả hoạt động đã đăng tải, còn hạn đăng ký
            const now = new Date();
            const activities = await db.Activity.findAll({
                where: {
                    activityStatus: 'Đã đăng tải',
                    registrationEnd: { [db.Sequelize.Op.gt]: now }
                },
                include: [{
                    model: db.Participation,
                    as: 'participations',
                    required: false
                }]
            });
            // Log dữ liệu để debug
            console.log('activities:', activities.map(a => ({
                id: a.activityID,
                status: a.activityStatus,
                regEnd: a.registrationEnd,
                capacity: a.capacity,
                participations: a.participations.map(p => p.studentID)
            })));
            // Lọc các hoạt động chưa đủ số lượng và sinh viên chưa đăng ký
            const available = activities.filter(act => {
                const registeredCount = act.participations.length;
                const hasRegistered = act.participations.some(p => String(p.studentID) === String(studentID));
                return Number(registeredCount) < Number(act.capacity) && !hasRegistered;
            });
            res.json({ activities: available });
        } catch (error) {
            console.error('Error fetching available activities for student:', error);
            res.status(500).json({ message: 'Error fetching available activities.' });
        }
    }

}

module.exports = ActivityController;