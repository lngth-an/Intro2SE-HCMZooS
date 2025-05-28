const db = require('../../models');
const { Op } = require('sequelize');

class ParticipationController {
  // GET /activity/:activityId/registrations
  static async getRegistrations(req, res) {
    try {
      const { activityId } = req.params;
      const { status, name, studentId } = req.query;
      const where = { activityID: activityId };
      if (status) where.participationStatus = status;
      if (studentId) where.studentID = studentId;
      // Join with Student and User
      const participations = await db.Participation.findAll({
        where,
        include: [{
          model: db.Student,
          as: 'student',
          include: [{
            model: db.User,
            as: 'user',
            where: name ? { name: { [Op.iLike]: `%${name}%` } } : {},
            required: false,
          }],
        }],
        order: [['participationID', 'ASC']],
      });
      const result = participations.map(p => ({
        participationID: p.participationID,
        studentID: p.studentID,
        studentName: p.student?.user?.name,
        sex: p.student?.sex,
        academicYear: p.student?.academicYear,
        faculty: p.student?.falculty,
        email: p.student?.user?.email,
        phone: p.student?.user?.phone,
        registrationStatus: p.participationStatus,
        registrationTime: p.createdAt || null,
      }));
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching registrations' });
    }
  }

  // PATCH /activity/:activityId/registrations/approve
  static async approveRegistrations(req, res) {
    const t = await db.sequelize.transaction();
    try {
      const { activityId } = req.params;
      let { ids, id, status } = req.body;
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      if (!ids && id) ids = [id];
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'No participation IDs provided' });
      }
      // Only update participations for this activity
      const updated = await db.Participation.update(
        { participationStatus: status },
        {
          where: {
            participationID: { [Op.in]: ids },
            activityID: activityId,
          },
          transaction: t,
        }
      );
      await t.commit();
      res.json({ message: `${updated[0]} registration(s) updated to ${status}` });
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.status(500).json({ message: 'Error updating registrations' });
    }
  }

  // PATCH /activity/:activityId/attendance/confirm
  static async confirmAttendance(req, res) {
    const t = await db.sequelize.transaction();
    try {
      const { activityId } = req.params;
      let { ids, id, status } = req.body;
      if (!status || !['present', 'absent'].includes(status)) {
        return res.status(400).json({ message: 'Invalid attendance status' });
      }
      if (!ids && id) ids = [id];
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'No participation IDs provided' });
      }
      // Only update participations for this activity and already approved
      const updated = await db.Participation.update(
        { type: status },
        {
          where: {
            participationID: { [Op.in]: ids },
            activityID: activityId,
            participationStatus: 'approved',
          },
          transaction: t,
        }
      );
      await t.commit();
      res.json({ message: `${updated[0]} attendance(s) marked as ${status}` });
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.status(500).json({ message: 'Error confirming attendance' });
    }
  }

  // GET /participation/open?domain=xxx
  static async getOpenActivities(req, res) {
    try {
      const { domain } = req.query;
      const now = new Date();
      const where = {
        activityStatus: 'published',
        registrationEnd: { [Op.gt]: now },
      };
      if (domain) {
        // Giả sử trường type hoặc domains là string hoặc array
        where.type = domain;
      }
      // Lấy số lượng đã đăng ký
      const activities = await db.Activity.findAll({
        where,
        include: [{
          model: db.Participation,
          as: 'participations',
          required: false,
        }],
      });
      // Lọc capacity
      const filtered = activities.filter(a => {
        const count = a.participations?.filter(p => p.participationStatus !== 'rejected' && p.participationStatus !== 'canceled').length || 0;
        return !a.capacity || count < a.capacity;
      });
      res.json({ activities: filtered });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching open activities' });
    }
  }

  // GET /participation/check-eligibility/:activityID
  static async checkEligibility(req, res) {
    try {
      const { activityID } = req.params;
      const studentID = req.user.studentID;
      const activity = await db.Activity.findByPk(activityID);
      if (!activity || activity.activityStatus !== 'published' || new Date(activity.registrationEnd) < new Date()) {
        return res.json({ eligible: false, reason: 'Hoạt động không hợp lệ hoặc đã hết hạn đăng ký.' });
      }
      // Kiểm tra đã đăng ký chưa
      const existed = await db.Participation.findOne({ where: { studentID, activityID, participationStatus: { [Op.ne]: 'canceled' } } });
      if (existed) return res.json({ eligible: false, reason: 'Bạn đã đăng ký hoạt động này.' });
      // Có thể kiểm tra thêm điều kiện khác (vd: năm học, khoa...)
      res.json({ eligible: true });
    } catch (err) {
      res.status(500).json({ eligible: false, reason: 'Lỗi hệ thống' });
    }
  }

  // POST /participation/register
  static async registerActivity(req, res) {
    try {
      const studentID = req.user.studentID;
      const { activityID, note } = req.body;
      // Validate
      if (!activityID) return res.status(400).json({ error: 'Thiếu activityID' });
      const activity = await db.Activity.findByPk(activityID);
      if (!activity || activity.activityStatus !== 'published' || new Date(activity.registrationEnd) < new Date()) {
        return res.status(400).json({ error: 'Hoạt động không hợp lệ hoặc đã hết hạn đăng ký.' });
      }
      // Kiểm tra đã đăng ký chưa
      const existed = await db.Participation.findOne({ where: { studentID, activityID, participationStatus: { [Op.ne]: 'canceled' } } });
      if (existed) return res.status(400).json({ error: 'Bạn đã đăng ký hoạt động này.' });
      // Tạo participation trạng thái draft
      console.log('studentID:', studentID, 'activityID:', activityID, 'note:', note);
      const participation = await db.Participation.create({
        studentID, activityID, participationStatus: 'draft', note
      });
      res.json({ participation });
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      res.status(500).json({ error: 'Lỗi đăng ký hoạt động' });
    }
  }

  // POST /participation/submit
  static async submitRegistration(req, res) {
    try {
      const studentID = req.user.studentID;
      const { participationID } = req.body;
      const participation = await db.Participation.findOne({ where: { participationID, studentID } });
      if (!participation || participation.participationStatus !== 'draft') {
        return res.status(400).json({ error: 'Đăng ký không hợp lệ.' });
      }
      participation.participationStatus = 'submitted';
      await participation.save();
      res.json({ message: 'Đăng ký đã được gửi xét duyệt.' });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi xác nhận đăng ký' });
    }
  }

  // GET /participation/suggest?domain=xxx
  static async suggestActivities(req, res) {
    try {
      const { domain } = req.query;
      const now = new Date();
      const where = {
        activityStatus: 'published',
        registrationEnd: { [Op.gt]: now },
        type: domain,
      };
      const activities = await db.Activity.findAll({ where });
      res.json({ activities });
    } catch (err) {
      res.status(500).json({ message: 'Error suggesting activities' });
    }
  }
}

module.exports = ParticipationController; 