// Mock authentication middleware for development
module.exports = (req, res, next) => {
    console.log('Running mockAuth middleware');
    req.user = { userID: 3, role: 'student', studentID: '2' }; // Thêm studentID hợp lệ
    //req.user = { id: 8, role: 'organizer'};
    console.log('req.user =', req.user);
    next();
};