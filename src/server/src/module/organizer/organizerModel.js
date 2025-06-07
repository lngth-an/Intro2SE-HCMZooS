const db = require('../../models');
const Organizer = db.Organizer;
const User = db.User;

async function getOrganizerByUserID(userID) {
  return Organizer.findOne({
    where: { userID },
    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'username', 'phone'] }]
  });
}

module.exports = { getOrganizerByUserID }; 