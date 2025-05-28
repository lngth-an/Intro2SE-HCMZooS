const SemesterModel = require('./semesterModel');

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
}

module.exports = SemesterController;