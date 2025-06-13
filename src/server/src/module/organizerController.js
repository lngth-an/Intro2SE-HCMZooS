const db = require('../models');
const { Organizer, User } = db;

class OrganizerController {
  static async getMe(req, res) {
    try {
      const userID = req.user.userID;
      
      // Kiểm tra role
      if (req.user.role !== 'organizer') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }

      const organizer = await Organizer.findOne({
        where: { userID },
        include: [{ 
          model: User, 
          as: 'user', 
          attributes: ['name', 'email'] 
        }]
      });

      if (!organizer) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin organizer' });
      }

      res.json({
        organizerID: organizer.organizerID,
        name: organizer.user?.name,
        email: organizer.user?.email,
        department: organizer.department,
        userID: organizer.userID,
      });
    } catch (error) {
      console.error('Error in getMe:', error);
      res.status(500).json({ 
        message: 'Lỗi server khi lấy thông tin organizer',
        error: error.message 
      });
    }
  }
}

module.exports = OrganizerController; 