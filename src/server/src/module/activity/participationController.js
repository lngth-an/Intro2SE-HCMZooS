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
}

module.exports = ParticipationController; 