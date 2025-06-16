const express = require('express');
const router = express.Router();
const AuthController = require('../module/auth/authController');
const { authenticateToken } = require('../module/auth/authMiddleware');

// UC101: Login
router.post('/login', AuthController.login);

// UC103: Logout
router.post('/logout', authenticateToken, AuthController.logout);

// Get current user info
router.get('/me', authenticateToken, AuthController.getCurrentUser);

// UC102: Forgot Password
router.post('/forgot-password', AuthController.forgotPassword);

// UC102: Reset Password
router.post('/reset-password', AuthController.resetPassword);
router.post('/change-password', authenticateToken, AuthController.changePassword);

module.exports = router; 