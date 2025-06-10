const { getStudentByUserID } = require('./studentModel');
const db = require('../../models');
const Activity = db.Activity;
const Organizer = db.Organizer;
const User = db.User;
const Student = db.Student;
const Participation = db.Participation;
const Semester = db.Semester;
const { Op, Sequelize } = require('sequelize');
const pool = require('../../config/database');

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

  // --- Search Activities ---
  static async searchActivities(req, res) {
    try {
      const {
        search,
        organizerName,
        minRegistrations,
        maxRegistrations,
        startDate,
        endDate,
        domain,
        sortBy = 'registrationStart',
        sortOrder = 'DESC',
        page = 1,
        limit = 10
      } = req.query;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = {
        activityStatus: 'published'
      };

      if (search) {
        whereConditions.name = {
          [Op.iLike]: `%${search}%`
        };
      }

      if (domain) {
        whereConditions.type = domain;
      }

      if (startDate) {
        whereConditions.eventStart = {
          [Op.gte]: startDate
        };
      }

      if (endDate) {
        whereConditions.eventEnd = {
          [Op.lte]: endDate
        };
      }

      // Build participation conditions
      const participationWhere = {};
      if (minRegistrations || maxRegistrations) {
        participationWhere[Op.and] = [];
        if (minRegistrations) {
          participationWhere[Op.and].push(Sequelize.literal(`(SELECT COUNT(*) FROM "participations" WHERE "activityID" = "Activity"."activityID") >= ${minRegistrations}`));
        }
        if (maxRegistrations) {
          participationWhere[Op.and].push(Sequelize.literal(`(SELECT COUNT(*) FROM "participations" WHERE "activityID" = "Activity"."activityID") <= ${maxRegistrations}`));
        }
      }

      // Execute query
      const { rows: activities, count } = await Activity.findAndCountAll({
        where: {
          ...whereConditions,
          ...participationWhere
        },
        include: [
          {
            model: Organizer,
            as: 'organizer',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['userID', 'name', 'email', 'phone'],
                where: organizerName ? {
                  name: {
                    [Op.iLike]: `%${organizerName}%`
                  }
                } : undefined
              }
            ]
          },
          {
            model: Participation,
            as: 'participations',
            attributes: ['participationID']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      res.json({
        activities,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error in searchActivities:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = StudentController;
