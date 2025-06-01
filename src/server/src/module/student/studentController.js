const { getStudentByUserID } = require('./studentModel');
const db = require('../../models');

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
      // Lấy tất cả participation của student trong các activity thuộc semesterID
      const participations = await db.Participation.findAll({
        where: { studentID, participationStatus: 'present' },
        include: [{ model: db.Activity, as: 'activity', where: { semesterID } }]
      });
      // Tổng hợp điểm rèn luyện từ participation.trainingPoint
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
      // Build where clause
      const where = { studentID };
      if (!allStatus) {
        where.participationStatus = 'present';
      }
      // Nếu có semesterID, filter qua activity
      const include = [{ model: db.Activity, as: 'activity' }];
      if (semesterID) {
        include[0].where = { semesterID };
      }
      const participations = await db.Participation.findAll({
        where,
        include
      });
      // Trả về thông tin từng participation và activity liên quan
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
}

module.exports = StudentController; 