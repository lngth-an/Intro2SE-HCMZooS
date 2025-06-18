const db = require('../../models');

class ComplaintController {
  static async submitComplaint(req, res) {
    try {
      if (!req.user || req.user.role !== 'student') {
        return res.status(403).json({ message: 'Chỉ sinh viên mới được gửi khiếu nại.' });
      }
      const { participationID, description } = req.body;
      if (!participationID || !description || !description.trim()) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
      }
      // Kiểm tra participation thuộc về student hiện tại
      const participation = await db.Participation.findOne({
        where: { participationID, studentID: req.user.studentID }
      });
      if (!participation) {
        return res.status(404).json({ message: 'Không tìm thấy hoạt động hoặc bạn không có quyền khiếu nại.' });
      }
      // (Optional) Kiểm tra đã có điểm rèn luyện hoặc trạng thái hợp lệ
      // if (participation.participationStatus !== 'approved') {
      //   return res.status(400).json({ message: 'Chỉ khi đã có điểm rèn luyện mới được khiếu nại.' });
      // }
      // Kiểm tra trùng lặp
      const existed = await db.Complaint.findOne({
        where: {
          participationID,
          description,
          complaintStatus: 'Chờ duyệt',
        }
      });
      if (existed) {
        return res.status(409).json({ message: 'Bạn đã gửi khiếu nại này trước đó và đang chờ xử lý.' });
      }
      // Tạo complaint
      const complaint = await db.Complaint.create({
        participationID,
        description,
        complaintStatus: 'Chờ duyệt',
      });
      // (Tùy chọn) Thông báo cho organizer
      // TODO: Gửi notification cho organizer của activity này
      res.status(201).json({ message: 'Gửi khiếu nại thành công!', complaint });
    } catch (err) {
      console.error('Error submitting complaint:', err);
      res.status(500).json({ message: 'Lỗi khi gửi khiếu nại.' });
    }
  }

  // GET /complaint/organizer?activityID=&status=
  static async getComplaintsByOrganizer(req, res) {
    try {
      if (!req.user || req.user.role !== 'organizer') {
        return res.status(403).json({ message: 'Chỉ organizer mới được xem khiếu nại.' });
      }
      // Lấy organizerID
      const organizer = await db.Organizer.findOne({ where: { userID: req.user.userID } });
      if (!organizer) return res.status(403).json({ message: 'Organizer not found' });
      // Lấy danh sách activityID do organizer quản lý
      const activities = await db.Activity.findAll({ where: { organizerID: organizer.organizerID } });
      const activityIDs = activities.map(a => a.activityID);
      // Filter
      const { activityID, status } = req.query;
      const where = {};
      if (status) where.complaintStatus = status;
      const participationWhere = {};
      if (activityID) participationWhere.activityID = activityID;
      else participationWhere.activityID = activityIDs;
      // Lấy complaint liên quan các activity này
      const complaints = await db.Complaint.findAll({
        where: {
          ...where,
          participationID: { [db.Sequelize.Op.ne]: null },
        },
        include: [
          {
            model: db.Participation,
            as: 'participation',
            where: participationWhere,
            include: [
              { model: db.Student, as: 'student', include: [{ model: db.User, as: 'user', attributes: ['name'] }] },
              { model: db.Activity, as: 'activity', attributes: ['activityID', 'name'] },
            ]
          }
        ]
      });
      res.json({
        complaints: complaints.map(c => ({
          complaintID: c.complaintID,
          description: c.description,
          complaintStatus: c.complaintStatus,
          response: c.response,
          studentName: c.participation?.student?.user?.name,
          studentID: c.participation?.student?.studentID,
          activityName: c.participation?.activity?.name,
          activityID: c.participation?.activity?.activityID,
          participationID: c.participationID,
          currentPoint: c.participation?.trainingPoint,
          createdAt: c.createdAt,
        }))
      });
    } catch (err) {
      console.error('Error getComplaintsByOrganizer:', err);
      res.status(500).json({ message: 'Lỗi lấy danh sách khiếu nại.' });
    }
  }

  // GET /complaint/:id
  static async getComplaintDetail(req, res) {
    try {
      const { id } = req.params;
      const complaint = await db.Complaint.findOne({
        where: { complaintID: id },
        include: [
          {
            model: db.Participation,
            as: 'participation',
            include: [
              { model: db.Student, as: 'student', include: [{ model: db.User, as: 'user', attributes: ['name', 'email'] }] },
              { model: db.Activity, as: 'activity', attributes: ['activityID', 'name'] },
            ]
          }
        ]
      });
      if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
      res.json({
        complaint: {
          complaintID: complaint.complaintID,
          description: complaint.description,
          complaintStatus: complaint.complaintStatus,
          response: complaint.response,
          studentName: complaint.participation?.student?.user?.name,
          studentID: complaint.participation?.student?.studentID,
          studentEmail: complaint.participation?.student?.user?.email,
          activityName: complaint.participation?.activity?.name,
          activityID: complaint.participation?.activity?.activityID,
          participationID: complaint.participationID,
          currentPoint: complaint.participation?.trainingPoint,
          createdAt: complaint.createdAt,
        }
      });
    } catch (err) {
      console.error('Error getComplaintDetail:', err);
      res.status(500).json({ message: 'Lỗi lấy chi tiết khiếu nại.' });
    }
  }

  // PATCH /complaint/:id
  static async updateComplaintStatus(req, res) {
    try {
      if (!req.user || req.user.role !== 'organizer') {
        return res.status(403).json({ message: 'Chỉ organizer mới được cập nhật khiếu nại.' });
      }
      const { id } = req.params;
      const { status, response } = req.body;
      if (!['Đã duyệt', 'Từ chối', 'Chờ duyệt'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
      }
      const complaint = await db.Complaint.findByPk(id);
      if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
      complaint.complaintStatus = status;
      if (response) {
        complaint.response = response;
      }
      await complaint.save();
      // TODO: Gửi notification cho student
      res.json({ message: 'Cập nhật trạng thái khiếu nại thành công.' });
    } catch (err) {
      console.error('Error updateComplaintStatus:', err);
      res.status(500).json({ message: 'Lỗi cập nhật trạng thái khiếu nại.' });
    }
  }
}

module.exports = ComplaintController; 