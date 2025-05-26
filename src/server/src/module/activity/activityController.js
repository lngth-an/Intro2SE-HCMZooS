const ActivityModel = require('./activityModel');

class ActivityController {

    static async getFilterActivity(req, res) {
        try {
            const popularActivities = await ActivityModel.getFilterActivity();
            res.status(200).json(popularActivities); // Trả về attractions sau khi lọc
        } catch (error) {
            console.error("Error in getFilterActivity:", error);
            res.status(500).json({ message: 'Error retrieving filtered activities' });
        }
    }
}

module.exports = ActivityController;