const express = require('express');
const router = express.Router();
const UserController = require('../module/user/userController');
const mockAuth = require('../mockAuth');

// Get current user profile
router.get('/profile', mockAuth, UserController.getProfile);
// Update profile info
router.patch('/profile', mockAuth, UserController.updateProfile);
// Change password
router.patch('/change-password', mockAuth, UserController.changePassword);

module.exports = router; 