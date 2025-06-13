// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const SemesterController = require('../module/semester/semesterController');
const { authenticateToken } = require('../module/auth/authMiddleware');

router.get('/getFilterSemester', authenticateToken, SemesterController.getFilterSemester);
router.get('/current', authenticateToken, SemesterController.getCurrentSemester);
//router.get('/by-student/:studentID', SemesterController.getSemestersByStudent);
router.get('/by-me', authenticateToken, SemesterController.getSemestersByMe);

module.exports = router;