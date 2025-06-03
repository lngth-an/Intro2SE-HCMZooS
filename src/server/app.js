const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const cookieParser = require('cookie-parser');
const mockAuth = require('./src/mockAuth');
const { authenticateToken, requireRole } = require('./src/module/auth/authMiddleware');

const PORT = process.env.PORT || 3001;

// Cấu hình CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Cấu hình Socket.IO
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Lưu io instance để sử dụng trong các module khác
app.set('io', io);

// Import routes
const activityRoutes = require('./src/routes/activityRoutes'); 
const semesterRoutes = require('./src/routes/semesterRoutes'); 
const participationRoutes = require('./src/routes/participationRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const authRoutes = require('./src/routes/authRoutes');
const organizerRoutes = require('./src/routes/organizerRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ==================== ROUTES ====================

// 1. Authentication Routes (Không yêu cầu xác thực)
// UC101: Login
// UC102: Forgot/Reset Password
// UC103: Logout
app.use('/auth', authRoutes);

// 2. Organizer Routes (Yêu cầu xác thực)
app.use('/organizer', organizerRoutes);

// 3. Notification Routes (Yêu cầu xác thực)
app.use('/notifications', notificationRoutes);

// 2. Activity Routes (Yêu cầu role organizer)
// UC501: CRUD Activities
// UC502: List/View Activities
app.use('/activity', authenticateToken, requireRole(['organizer']), activityRoutes);

// 3. Participation Routes (Yêu cầu role student)
// UC601: Register/Submit Activities
app.use('/participation', authenticateToken, requireRole(['student']), participationRoutes);

// 4. Student Routes (Yêu cầu role student)
// UC701: View Student Info/Scores
app.use('/student', authenticateToken, requireRole(['student']), studentRoutes);

// 5. Semester Routes (Yêu cầu xác thực)
// UC801: View Semester Info
app.use('/semester', authenticateToken, semesterRoutes);

// 6. Test Route (Không yêu cầu xác thực)
app.get('/test', (req, res) => {
  res.json({ message: 'Hello, this is a test' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Có lỗi xảy ra',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Khởi động server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

