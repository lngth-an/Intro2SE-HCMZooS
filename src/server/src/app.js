const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);

// Cấu hình CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Cấu hình Socket.IO
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Lưu io instance để sử dụng trong các module khác
app.set('io', io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/organizer', require('./routes/organizerRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 