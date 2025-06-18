const jwt = require('jsonwebtoken');
const { User, Student } = require('../../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware xác thực token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userID, {
      include: [{
        model: Student,
        as: 'student',
        attributes: ['studentID']
      }]
    });
    
    
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    // Chuyển user thành plain object và gán studentID nếu là sinh viên
    const plainUser = user.toJSON();
    if (plainUser.role === 'student' && plainUser.student) {
      plainUser.studentID = plainUser.student.studentID;
    }
    req.user = plainUser;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware kiểm tra role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET
}; 