const db = require('../../models');
const User = db.User;
const PasswordReset = require('../../models/passwordReset.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Get current user info
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userID);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Không gửi password về client
    const userData = {
      userID: user.userID,
      email: user.email,
      name: user.name,
      role: user.role,
      studentID: user.studentID,
      class: user.class,
      phone: user.phone
    };

    res.json(userData);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// UC101: Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });
    
    const user = await User.findOne({ where: { email } });
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác!' });
    }

    console.log('Checking password...');
    let isMatch = false;
    
    // Kiểm tra nếu password đã được hash
    if (user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Nếu password chưa được hash, so sánh trực tiếp
      isMatch = password === user.password;
      
      // Nếu match, hash password và lưu lại
      if (isMatch) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await user.update({ password: hashedPassword });
      }
    }
    
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác!' });
    }

    const token = jwt.sign(
      { userID: user.userID, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    // Không gửi password về client
    const userData = {
      userID: user.userID,
      email: user.email,
      name: user.name,
      role: user.role,
      studentID: user.studentID,
      class: user.class,
      phone: user.phone
    };

    res.json({
      message: 'Đăng nhập thành công',
      token: token,
      role: user.role,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// UC103: Logout
exports.logout = async (req, res) => {
  try {
    // Xóa cookie token
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // Xóa token trong header
    res.removeHeader('Authorization');

    res.json({ 
      message: 'Đăng xuất thành công',
      success: true
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: 'Lỗi server',
      success: false,
      error: error.message 
    });
  }
};

// UC102: Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng với email này' });
    }

    // Tạo token reset password
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Lưu token vào database
    await PasswordReset.create({
      userID: user.userID,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000) // Token hết hạn sau 1 giờ
    });

    // Gửi email reset password
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Reset Password',
      html: `
        <p>Bạn đã yêu cầu reset password.</p>
        <p>Click vào link sau để reset password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
      `
    });

    res.json({ message: 'Email reset password đã được gửi' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// UC102: Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Thiếu token hoặc mật khẩu mới' });
    }

    // Tìm tất cả các token chưa hết hạn
    const passwordResets = await PasswordReset.findAll({
      where: {
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    // So sánh token
    let passwordReset = null;
    for (const pr of passwordResets) {
      const match = await bcrypt.compare(token, pr.token);
      if (match) {
        passwordReset = pr;
        break;
      }
    }

    if (!passwordReset) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Update password
    const user = await User.findByPk(passwordReset.userID);
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedPassword });

    // Xóa token đã sử dụng
    await passwordReset.destroy();

    res.json({ message: 'Password đã được reset thành công' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đổi mật khẩu cho user đã đăng nhập
exports.changePassword = async (req, res) => {
  try {
    const userID = req.user.userID; // Lấy từ middleware xác thực JWT
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Thiếu mật khẩu hiện tại hoặc mật khẩu mới' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải ít nhất 6 ký tự' });
    }
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 