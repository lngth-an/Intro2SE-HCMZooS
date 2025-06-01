const db = require('../../models');
const Activity = db.Activity;
const Organizer = db.Organizer;
const Participation = db.Participation;
const { Op } = require('sequelize');

// Get organizer statistics
exports.getStats = async (req, res) => {
  try {
    const userID = req.user.userID;

    // Lấy organizerID từ userID
    const organizer = await Organizer.findOne({
      where: { userID }
    });

    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    const organizerID = organizer.organizerID;

    // 1. Tổng số hoạt động do organizer tổ chức
    const totalActivities = await Activity.count({
      where: { organizerID }
    });

    // 2. Số hoạt động đang mở đăng ký
    const ongoingActivities = await Activity.count({
      where: {
        organizerID,
        registrationStart: { [Op.lte]: new Date() },
        registrationEnd: { [Op.gte]: new Date() }
      }
    });

    // 3. Tổng số lượt tham gia vào hoạt động do organizer tổ chức
    const totalParticipations = await Participation.count({
      include: [{
        model: Activity,
        as: 'activity',
        where: { organizerID }
      }]
    });

    // 4. Lượt đăng ký trong tháng này (tạm thời bỏ qua do thiếu timestamps)
    /*
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyParticipations = await Participation.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      },
      include: [{
        model: Activity,
        as: 'activity',
        where: { organizerID }
      }]
    });
    */

    return res.json({
      totalActivities,
      ongoingActivities,
      totalParticipations,
      // monthlyParticipations
    });

  } catch (error) {
    console.error('Error getting organizer stats:', error);
    res.status(500).json({ message: 'Lỗi server khi thống kê' });
  }
};
