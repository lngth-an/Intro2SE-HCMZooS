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
}

module.exports = SemesterController;