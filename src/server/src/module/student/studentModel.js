const db = require('../../models');
const Student = db.Student;
const User = db.User;

async function getStudentByUserID(userID) {
  return Student.findOne({
    where: { userID },
    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'username'] }]
  });
}

module.exports = { getStudentByUserID };