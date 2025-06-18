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
        where: { studentID, participationStatus: 'Đã hoàn thành' },
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
        where.participationStatus = 'Đã hoàn thành';
      }
      const include = [{ 
        model: db.Activity, 
        as: 'activity',
        attributes: [
          'activityID',
          'name',
          'description',
          'eventStart',
          'eventEnd',
          'registrationStart',
          'registrationEnd',
          'location',
          'image',
          'activityStatus',
          'type'
        ]
      }];
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
        description: p.activity?.description,
        trainingPoint: p.trainingPoint || 0,
        participationStatus: p.participationStatus,
        eventStart: p.activity?.eventStart,
        eventEnd: p.activity?.eventEnd,
        registrationStart: p.activity?.registrationStart,
        registrationEnd: p.activity?.registrationEnd,
        location: p.activity?.location,
        image: p.activity?.image || null,
        activityStatus: p.activity?.activityStatus,
        type: p.activity?.type || ''
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
        eventStart,
        eventEnd,
        type,
        sortBy = 'registrationStart',
        sortOrder = 'DESC',
        page = 1,
        limit = 10
      } = req.query;

      const offset = (page - 1) * limit;
      const parsedLimit = parseInt(limit);
      const parsedPage = parseInt(page);

      const havingConditions = {};

      const whereConditions = {
        activityStatus: 'Đã đăng tải' 
      };

      if (search) {
        whereConditions[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (organizerName) {
        whereConditions['$organizer.user.name$'] = {
          [Op.iLike]: `%${organizerName}%`
        };
      }

      if (minRegistrations) {
        havingConditions['registrationCount'] = {
          [Op.gte]: minRegistrations
        };
      }

      if (maxRegistrations) {
        havingConditions['registrationCount'] = {
          ...havingConditions['registrationCount'],
          [Op.lte]: maxRegistrations
        };
      }

      if (eventStart) {
        whereConditions. eventStart = {
          [Op.gte]:  eventStart
        };
      }

      if (eventEnd) {
        whereConditions.eventEnd = {
          [Op.lte]: eventEnd
        };
      }

      if (type) {
        whereConditions.type = type;
      }

      const allowedSortFields = ['registrationStart', 'eventStart', 'eventEnd', 'name'];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'registrationStart';

      // Truy vấn dữ liệu (có pagination)
      const activities = await Activity.findAll({
        where: whereConditions,
        include: [
          {
            model: Organizer,
            as: 'organizer',
            attributes: ['organizerID'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['userID', 'name', 'email', 'phone']
              }
            ]
          },
          {
            model: Participation,
            as: 'participations',
            attributes: []
          }
        ],
        attributes: {
          include: [
            [Sequelize.fn('COUNT', Sequelize.col('participations.participationID')), 'registrationCount']
          ]
        },
        group: [
          'Activity.activityID',
          'organizer.organizerID',
          'organizer->user.userID'
        ],
        having: Object.keys(havingConditions).length > 0 ? havingConditions : undefined,
        order: [[safeSortBy, sortOrder]],
        limit: parsedLimit,
        offset: offset,
        subQuery: false
      });

      // Truy vấn tổng số lượng activity phù hợp (không phân trang)
      const totalResults = await Activity.findAll({
        where: whereConditions,
        include: [
          {
            model: Organizer,
            as: 'organizer',
            attributes: ['organizerID'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['userID', 'name', 'email', 'phone']
              }
            ]
          },
          {
            model: Participation,
            as: 'participations',
            attributes: []
          }
        ],
        attributes: [
          'activityID',
          [Sequelize.fn('COUNT', Sequelize.col('participations.participationID')), 'registrationCount']
        ],
        group: [
          'Activity.activityID',
          'organizer.organizerID',
          'organizer->user.userID'
        ],
        having: Object.keys(havingConditions).length > 0 ? havingConditions : undefined,
        raw: true,
        subQuery: false
      });

      // Map kết quả để trả về name thay vì department
      const mappedActivities = activities.map(activity => ({
        ...activity.toJSON(),
        organizerName: activity.organizer?.user?.name || 'Đang cập nhật'
      }));

      res.json({
        activities: mappedActivities,
        pagination: {
          total: totalResults.length,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(totalResults.length / parsedLimit)
        }
      });
    } catch (error) {
      console.error('Error in searchActivities:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


}

module.exports = StudentController;
