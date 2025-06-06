const db = require('../models');

class OrganizerController {
  static async getMe(req, res) {
    try {
      const userID = req.user.userID;
      const organizer = await db.Organizer.findOne({
        where: { userID },
        include: [{ model: db.User, as: 'user', attributes: ['name', 'avatar'] }]
      });
      if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
      res.json({
        organizerID: organizer.organizerID,
        name: organizer.user?.name,
        avatar: organizer.user?.avatar || '',
        department: organizer.department,
        userID: organizer.userID,
      });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching organizer info' });
    }
  }
}

module.exports = OrganizerController; 