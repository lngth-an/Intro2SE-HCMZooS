// Mock authentication middleware for development
module.exports = (req, res, next) => {
    //req.user = { userID: 3, role: 'student', studentID: '2' }; // Thêm studentID hợp lệ
    req.user = { userID: 8, role: 'organizer', organizerID: '3' };
    next();
};