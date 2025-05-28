const db = require('../../models');
const { Op } = require('sequelize');

const ParticipationModel = {
  async findByStudentAndActivity(studentID, activityID) {
    return db.Participation.findOne({
      where: { studentID, activityID, participationStatus: { [Op.ne]: 'canceled' } }
    });
  },
  async createParticipation(data) {
    return db.Participation.create(data);
  },
  async getOpenActivities(domain) {
    const now = new Date();
    const where = {
      activityStatus: 'published',
      registrationEnd: { [Op.gt]: now },
    };
    if (domain) where.type = domain;
    const activities = await db.Activity.findAll({
      where,
      include: [{ model: db.Participation, as: 'participations', required: false }],
    });
    return activities.filter(a => {
      const count = a.participations?.filter(p => p.participationStatus !== 'rejected' && p.participationStatus !== 'canceled').length || 0;
      return !a.capacity || count < a.capacity;
    });
  },
  async checkEligibility(studentID, activityID) {
    const activity = await db.Activity.findByPk(activityID);
    if (!activity || activity.activityStatus !== 'published' || new Date(activity.registrationEnd) < new Date()) {
      return { eligible: false, reason: 'Hoạt động không hợp lệ hoặc đã hết hạn đăng ký.' };
    }
    const existed = await db.Participation.findOne({ where: { studentID, activityID, participationStatus: { [Op.ne]: 'canceled' } } });
    if (existed) return { eligible: false, reason: 'Bạn đã đăng ký hoạt động này.' };
    return { eligible: true };
  },
  async getParticipationById(participationID, studentID) {
    return db.Participation.findOne({ where: { participationID, studentID } });
  },
  async updateParticipationStatus(participationID, status) {
    return db.Participation.update({ participationStatus: status }, { where: { participationID } });
  },
  async suggestActivities(domain) {
    const now = new Date();
    const where = {
      activityStatus: 'published',
      registrationEnd: { [Op.gt]: now },
      type: domain,
    };
    return db.Activity.findAll({ where });
  },
};

module.exports = ParticipationModel; 