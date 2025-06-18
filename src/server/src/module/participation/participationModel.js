const db = require('../../models');
const { Op } = require('sequelize');

const ParticipationModel = {
  async findByStudentAndActivity(studentID, activityID) {
    return db.Participation.findOne({
      where: { 
        studentID, 
        activityID, 
        participationStatus: { 
          [Op.notIn]: ['cancelled', 'rejected'] 
        } 
      }
    });
  },
  async createParticipation(data) {
    return db.Participation.create(data);
  },
  async getOpenActivities(domain) {
    const now = new Date();
    const where = {
      activityStatus: 'Đã đăng tải',
      registrationEnd: { [Op.gt]: now },
    };
    const activities = await db.Activity.findAll({
      where,
      include: [{ model: db.Participation, as: 'participations', required: false }],
    });
    return activities.filter(a => {
      const count = a.participations?.filter(p => 
        !['cancelled', 'rejected'].includes(p.participationStatus)
      ).length || 0;
      return !a.capacity || count < a.capacity;
    });
  },
  async checkEligibility(studentID, activityID) {
    const activity = await db.Activity.findByPk(activityID);
    if (!activity || activity.activityStatus !== 'Đã đăng tải' || new Date(activity.registrationEnd) < new Date()) {
      return { eligible: false, reason: 'Hoạt động không hợp lệ hoặc đã hết hạn đăng ký.' };
    }
    const existed = await db.Participation.findOne({ 
      where: { 
        studentID, 
        activityID, 
        participationStatus: { 
          [Op.notIn]: ['cancelled', 'rejected'] 
        } 
      } 
    });
    if (existed) {
      return { 
        eligible: false, 
        reason: existed.participationStatus === 'cancelled' 
          ? 'Bạn đã hủy đăng ký hoạt động này trước đó.' 
          : 'Bạn đã đăng ký hoạt động này.'
      };
    }
    return { eligible: true };
  },
  async getParticipationById(participationID, studentID) {
    return db.Participation.findOne({ where: { participationID, studentID } });
  },
  async updateParticipationStatus(participationID, status) {
    return db.Participation.update(
      { participationStatus: status }, 
      { where: { participationID } }
    );
  },
  async suggestActivities(domain) {
    const now = new Date();
    const where = {
      activityStatus: 'Đã đăng tải',
      registrationEnd: { [Op.gt]: now },
    };
    return db.Activity.findAll({ where });
  },
};

module.exports = ParticipationModel; 