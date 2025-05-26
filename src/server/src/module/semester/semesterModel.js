const db = require('../../config/database');

class SemesterModel {
    static async getFilterSemester() {
        const query = `
            SELECT * FROM public.semesters
            `
        const values = [];
        try {
            const result = await db.query(query, values);
            return (result.rows.length > 0) ? result.rows : [];
        } catch (err) {
            throw new Error('Error fetching tours by location: ' + err.message);
        }
    }
}

module.exports = SemesterModel