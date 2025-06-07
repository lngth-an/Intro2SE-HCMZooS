const db = require('../../models');
const bcrypt = require('bcrypt');

const getUserById = async (userID) => {
  return db.User.findOne({
    where: { userID },
    attributes: ['userID', 'name', 'role', 'phone', 'email']
  });
};

const updateUserProfile = async (userID, { name, email, phone }) => {
  return db.User.update(
    { name, email, phone },
    { where: { userID } }
  );
};

const changeUserPassword = async (userID, currentPassword, newPassword) => {
  const user = await db.User.findOne({ where: { userID } });
  if (!user) throw new Error('User not found');
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new Error('Current password is incorrect');
  const hashed = await bcrypt.hash(newPassword, 10);
  return db.User.update({ password: hashed }, { where: { userID } });
};

module.exports = {
  getUserById,
  updateUserProfile,
  changeUserPassword,
}; 