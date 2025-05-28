const { getStudentByUserID } = require('./studentModel');

// GET /student/me
async function getMe(req, res) {
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

module.exports = { getMe }; 