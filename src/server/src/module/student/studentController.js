const { getStudentByUserID } = require('./studentModel');
const db = require('../../models');
const Student = db.Student;
const Activity = db.Activity;
const Participation = db.Participation;
const { Op } = require('sequelize');
const { User } = require('../../models');

class StudentController {
  // GET /student/me
  static async getMe(req, res) {
    try {
      const userID = req.user.userID;
      const student = await getStudentByUserID(userID);
      if (!student) return res.status(404).json({ message: 'Student not found' });
      res.json({
        studentID: student.studentID,
        userID: student.userID,
        name: student.user?.name,
        email: student.user?.email,
        username: student.user?.username,
        phone: student.user?.phone,
        point: student.point,
        sex: student.sex,
        dateOfBirth: student.dateOfBirth,
        academicYear: student.academicYear,
        falculty: student.falculty,
      });
    } catch (err) {
      console.error('Lỗi /student/me:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  // GET /student/score?semesterID=...  Lấy điểm rèn luyện của sinh viên cho học kỳ
  static async getScore(req, res) {
    try {
      const studentID = req.user.studentID;
      const semesterID = req.query.semesterID;
      if (!studentID || !semesterID) return res.status(400).json({ message: 'Missing studentID or semesterID' });
      const participations = await db.Participation.findAll({
        where: { studentID, participationStatus: 'present' },
        include: [{ model: db.Activity, as: 'activity', where: { semesterID } }]
      });
      const score = participations.reduce((sum, p) => sum + (p.trainingPoint || 0), 0);
      res.json({ score });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching score' });
    }
  }

  // GET /student/activities?semesterID=...&allStatus=true  Lấy lịch sử hoạt động đã tham gia hoặc tất cả trạng thái
  static async getActivities(req, res) {
    try {
      const studentID = req.user.studentID;
      const semesterID = req.query.semesterID;
      const allStatus = req.query.allStatus === 'true';
      if (!studentID) return res.status(400).json({ message: 'Missing studentID' });
      const where = { studentID };
      if (!allStatus) {
        where.participationStatus = 'present';
      }
      const include = [{ model: db.Activity, as: 'activity' }];
      if (semesterID) {
        include[0].where = { semesterID };
      }
      const participations = await db.Participation.findAll({
        where,
        include
      });
      const activities = participations.map(p => ({
        participationID: p.participationID,
        activityID: p.activityID,
        name: p.activity?.name,
        type: p.activity?.type,
        trainingPoint: p.trainingPoint || 0,
        participationStatus: p.participationStatus,
        eventStart: p.activity?.eventStart,
        location: p.activity?.location,
        image: p.activity?.image || null
      }));
      res.json({ activities });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching activities' });
    }
  }

  // GET /student/stats
  static async getStats(req, res) {
    try {
      const userID = req.user.userID;

      const student = await Student.findOne({ where: { userID } });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const studentID = student.studentID;

      const totalParticipations = await Participation.count({ where: { studentID } });

      const ongoingParticipations = await Participation.count({
        include: [{
          model: Activity,
          as: 'activity',
          where: {
            eventStart: { [Op.lte]: new Date() },
            eventEnd: { [Op.gte]: new Date() }
          }
        }],
        where: { studentID }
      });

      const totalScore = await Participation.sum('trainingPoint', { where: { studentID } });

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyParticipations = await Participation.count({
        where: {
          studentID,
          //createdAt: { [Op.gte]: startOfMonth }
        }
      });

      return res.json({
        totalParticipations,
        ongoingParticipations,
        totalScore: totalScore || 0,
        monthlyParticipations
      });

    } catch (error) {
      console.error('Error getting student stats:', error);
      res.status(500).json({ message: 'Lỗi server khi thống kê' });
    }
  }
}

module.exports = StudentController;
