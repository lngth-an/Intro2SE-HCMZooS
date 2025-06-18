const db = require('../../models');
const { Op } = require('sequelize');
const Activity = db.Activity;
const User = db.User;
const Participation = db.Participation;
const Semester = db.Semester;
const Organizer = db.Organizer;

class ActivityModel {
    static async createActivity(data) {
        return db.Activity.create(data);
    }

    static async updateActivity(activityID, organizerID, data) {
        return db.Activity.update(data, {
            where: { activityID, organizerID, activityStatus: 'Bản nháp' },
        });
    }

    static async deleteActivity(activityID, organizerID) {
        return db.Activity.destroy({
            where: { activityID, organizerID, activityStatus: 'Bản nháp' },
        });
    }

    static async publishActivity(activityID, organizerID) {
        return db.Activity.update(
            { activityStatus: 'Đẵ đăng tải' },
            { where: { activityID, organizerID, activityStatus: 'Bản nháp' } }
        );
    }

    static async getActivityById(activityID, organizerID) {
        return db.Activity.findOne({ where: { activityID, organizerID } });
    }

    static async listActivities(organizerID, filters, pagination) {
        const where = { organizerID };
        if (filters.status) where.activityStatus = filters.status;
        if (filters.keyword) where.name = { [Op.iLike]: `%${filters.keyword}%` };
        if (filters.dateFrom || filters.dateTo) {
            where.eventStart = {};
            if (filters.dateFrom) where.eventStart[Op.gte] = new Date(filters.dateFrom);
            if (filters.dateTo) where.eventStart[Op.lte] = new Date(filters.dateTo);
        }
        const { page = 1, limit = 10 } = pagination;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        return db.Activity.findAndCountAll({
            where,
            offset,
            limit: parseInt(limit),
            order: [['eventStart', 'DESC']],
        });
    }

    static async countByStatus(organizerID, status) {
        return db.Activity.count({ where: { organizerID, activityStatus: status } });
    }

    // Get activities by organizer ID with associations
    static async getActivitiesByOrganizer(organizerID) {
        try {
            const activities = await Activity.findAll({
                where: { organizerID },
                include: [{
                    model: Organizer,
                    as: 'organizer',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['userID', 'name', 'email']
                    }]
                }, {
                    model: Semester,
                    as: 'semester',
                    attributes: ['semesterID', 'semesterName']
                }],
            });
            return activities;
        } catch (error) {
            console.error('Error in getActivitiesByOrganizer:', error);
            throw error;
        }
    }
}

module.exports = ActivityModel;