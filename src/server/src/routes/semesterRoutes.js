// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const SemesterController = require('../module/semester/semesterController');

router.get('/getFilterSemester', SemesterController.getFilterSemester);
router.get('/current', SemesterController.getCurrentSemester);

module.exports = router;