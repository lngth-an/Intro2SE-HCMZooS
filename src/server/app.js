console.log('=== APP.JS STARTED ===');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const cookieParser = require('cookie-parser');
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
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

// Xử lý Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
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

// 2. Organizer Routes (Yêu cầu xác thực và role organizer)
app.use('/organizer', authenticateToken, requireRole(['organizer']), organizerRoutes);

// 3. Notification Routes (Yêu cầu xác thực)
app.use('/notifications', authenticateToken, notificationRoutes);

// 4. Activity Routes (Yêu cầu role organizer)
// UC501: CRUD Activities
// UC502: List/View Activities
// Route dành riêng cho student (không requireRole organizer)
app.use('/activity/available-for-student', authenticateToken, activityRoutes);
// Các route còn lại cho organizer
app.use('/activity', authenticateToken, requireRole(['organizer']), activityRoutes);

// 5. Participation Routes (Yêu cầu role student)
// UC601: Register/Submit Activities
app.use('/participation', authenticateToken, requireRole(['student']), participationRoutes);

// 6. Student Routes (Yêu cầu role student)
// UC701: View Student Info/Scores
app.use('/student', authenticateToken, requireRole(['student']), studentRoutes);

// 7. Semester Routes (Yêu cầu xác thực)
// UC801: View Semester Info
app.use('/semester', authenticateToken, semesterRoutes);

// 8. Test Route (Không yêu cầu xác thực)
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
