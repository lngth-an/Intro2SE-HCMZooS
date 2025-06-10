const db = require('../../models');
const Activity = db.Activity;
const Organizer = db.Organizer;
const Participation = db.Participation;
const { Op } = require('sequelize');
const { getOrganizerByUserID } = require('./organizerModel');
const User = db.User;

// Get organizer statistics
const getStats = async (req, res) => {
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

// GET /organizer/me
const getMe = async (req, res) => {
  try {
    const userID = req.user.userID;
    const organizer = await getOrganizerByUserID(userID);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
    
    res.json({
      organizerID: organizer.organizerID,
      userID: organizer.userID,
      name: organizer.user?.name,
      email: organizer.user?.email,
      username: organizer.user?.username,
      phone: organizer.user?.phone,
      department: organizer.department,
      position: organizer.position
    });
  } catch (err) {
    console.error('Lỗi /organizer/me:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /organizer/me
const updateMe = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { email, phone } = req.body;

    // Validation
    if (!email || !phone) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }
    if (!/^\d{9,11}$/.test(phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
    }

    // Update user info
    await User.update(
      { email, phone },
      { where: { userID } }
    );

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('Lỗi PATCH /organizer/me:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getStats,
  getMe,
  updateMe
};
