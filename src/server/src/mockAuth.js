// Mock authentication middleware for development
module.exports = (req, res, next) => {
    console.log('Running mockAuth middleware');
    req.user = { id: 3, role: 'student', studentID: '2' }; // Thêm studentID hợp lệ
    console.log('req.user =', req.user);
    next();
};