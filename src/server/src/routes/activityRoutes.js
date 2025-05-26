// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const ActivityController = require('../module/activity/activityController');

router.get('/getFilterActivity', ActivityController.getFilterActivity);

module.exports = router;