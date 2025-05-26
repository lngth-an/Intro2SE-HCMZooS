const db = require('../../config/database');

class ActivityModel {
    static async getFilterActivity() {
        const query = `
            SELECT * FROM public.activities
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

module.exports = ActivityModel