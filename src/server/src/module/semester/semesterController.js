const SemesterModel = require('./semesterModel');
const db = require('../../models');

class SemesterController {

    static async getFilterSemester(req, res) {
        try {
            const popularSemesters = await SemesterModel.getFilterSemester();
            res.status(200).json(popularSemesters); // Trả về attractions sau khi lọc
        } catch (error) {
            console.error("Error in getFilterSemester:", error);
            res.status(500).json({ message: 'Error retrieving filtered semesters' });
        }
    }

    static async getCurrentSemester(req, res) {
        try {
            const today = new Date();
            // today.setHours(today.getHours() + 7);
            
            const semester = await db.Semester.findOne({
                where: {
                    semesterStart: { [db.Sequelize.Op.lte]: today },
                    semesterEnd: { [db.Sequelize.Op.gte]: today },
                },
                order: [['semesterStart', 'DESC']],
            });
            if (!semester) return res.json(null);
            res.json(semester);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching current semester' });
        }
    }

    // GET /semester/by-student/:studentID - Lấy các semester theo khóa của student
    static async getSemestersByStudent(req, res) {
        try {
            const { studentID } = req.params;
            const student = await db.Student.findOne({ where: { studentID } });
            if (!student) return res.status(404).json({ message: 'Student not found' });
            const startYear = parseInt(student.academicYear);
            const endYear = startYear + 4;
            const semesters = await db.Semester.findAll();
            const filtered = semesters.filter(sem => {
                const match = sem.semesterName && sem.semesterName.match(/(\d{4})/);
                if (!match) return false;
                const year = parseInt(match[1]);
                return year >= startYear && year <= endYear;
            });
            res.json({ semesters: filtered });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching semesters by student' });
        }
    }

    // GET /semester/by-me - Lấy các semester theo student hiện tại
    static async getSemestersByMe(req, res) {
        try {
            const studentID = req.user.studentID;
            if (!studentID) return res.status(401).json({ message: 'Not a student or not logged in' });
            const student = await db.Student.findOne({ where: { studentID } });
            if (!student) return res.status(404).json({ message: 'Student not found' });
            const startYear = parseInt(student.academicYear);
            const endYear = startYear + 4;
            const semesters = await db.Semester.findAll();
            const filtered = semesters.filter(sem => {
                const match = sem.semesterName && sem.semesterName.match(/(\d{4})/);
                if (!match) return false;
                const year = parseInt(match[1]);
                return year >= startYear && year <= endYear;
            });
            res.json({ semesters: filtered });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching semesters by current student' });
        }
    }
}

module.exports = SemesterController;