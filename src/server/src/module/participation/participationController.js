const ParticipationModel = require('./participationModel');

class ParticipationController {
  static async getOpenActivities(req, res) {
    try {
      const { domain } = req.query;
      const activities = await ParticipationModel.getOpenActivities(domain);
      res.json({ activities });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching open activities' });
    }
  }

  static async checkEligibility(req, res) {
    try {
      const { activityID } = req.params;
      const studentID = req.user.studentID;
      const result = await ParticipationModel.checkEligibility(studentID, activityID);
      res.json(result);
    } catch (err) {
      res.status(500).json({ eligible: false, reason: 'Lỗi hệ thống' });
    }
  }

  static async registerActivity(req, res) {
    try {
      const studentID = req.user.studentID;
      const { activityID, note } = req.body;
      if (!activityID) return res.status(400).json({ error: 'Thiếu activityID' });
      const eligible = await ParticipationModel.checkEligibility(studentID, activityID);
      if (!eligible.eligible) return res.status(400).json({ error: eligible.reason });
      const participation = await ParticipationModel.createParticipation({
        studentID, activityID, participationStatus: 'draft', note
      });
      res.json({ participation });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi đăng ký hoạt động' });
    }
  }

  static async submitRegistration(req, res) {
    try {
      const studentID = req.user.studentID;
      const { participationID } = req.body;
      const participation = await ParticipationModel.getParticipationById(participationID, studentID);
      if (!participation || participation.participationStatus !== 'draft') {
        return res.status(400).json({ error: 'Đăng ký không hợp lệ.' });
      }
      await ParticipationModel.updateParticipationStatus(participationID, 'submitted');
      res.json({ message: 'Đăng ký đã được gửi xét duyệt.' });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi xác nhận đăng ký' });
    }
  }

  static async suggestActivities(req, res) {
    try {
      const { domain } = req.query;
      const activities = await ParticipationModel.suggestActivities(domain);
      res.json({ activities });
    } catch (err) {
      res.status(500).json({ message: 'Error suggesting activities' });
    }
  }
}

module.exports = ParticipationController; 