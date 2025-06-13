const db = require('../../models');
const userModel = require('./userModel');

class UserController {
  static async getMe(req, res) {
    try {
      const userID = req.user.userID;
      const user = await db.User.findOne({
        where: { userID },
        attributes: ['userID', 'name', 'role', 'phone', 'email']
      });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      console.error('Lỗi trong getMe:', err);
      res.status(500).json({ message: 'Error fetching user info' });
    }
  }

  // GET /user/profile
  static async getProfile(req, res) {
    try {
      const userID = req.user.userID;
      const user = await userModel.getUserById(userID);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      console.error('Error in getProfile:', err);
      res.status(500).json({ message: 'Error fetching user info' });
    }
  }

  // PATCH /user/profile
  static async updateProfile(req, res) {
    try {
      const userID = req.user.userID;
      const { name, email, phone } = req.body;
      if (!name || !email || !phone) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      // Simple validation
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      if (!/^\d{9,11}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number' });
      }
      await userModel.updateUserProfile(userID, { name, email, phone });
      res.json({ message: 'Profile updated successfully' });
    } catch (err) {
      console.error('Error in updateProfile:', err);
      res.status(500).json({ message: 'Error updating profile' });
    }
  }

  // PATCH /user/change-password
  static async changePassword(req, res) {
    try {
      const userID = req.user.userID;
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
      await userModel.changeUserPassword(userID, currentPassword, newPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error('Error in changePassword:', err);
      res.status(400).json({ message: err.message || 'Error changing password' });
    }
  }
}

module.exports = UserController; 