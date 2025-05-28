module.exports = (sequelize, DataTypes) => {
    const Activity = sequelize.define('Activity', {
        activityID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        semesterID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'semesters',
                key: 'semesterID',
            },
        },
        organizerID: {
            type: DataTypes.STRING,
            references: {
                model: 'organizers',
                key: 'organizerID'
            }
        },
        name: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.TEXT,
        },
        type: {
            type: DataTypes.STRING,
        },
        activityStatus: {
            type: DataTypes.STRING,
        },
        registrationStart: {
            type: DataTypes.DATE,
        },
        registrationEnd: {
            type: DataTypes.DATE,
        },
        eventStart: {
            type: DataTypes.DATE,
        },
        eventEnd: {
            type: DataTypes.DATE,
        },
        location: {
            type: DataTypes.STRING,
        },
        capacity: {
            type: DataTypes.INTEGER,
        },
        image: {
            type: DataTypes.STRING,
        },
    },{
        tableName: 'activities',
        timestamps: false, // createdAt, updatedAt
    });

    Activity.associate = (models) => {
        Activity.belongsTo(models.Semester, {
            foreignKey: 'semester_id',
            as: 'semester',
        });
        Activity.belongsTo(models.Organizer, {
            foreignKey: 'organizer_id',
            as: 'organizer',
        });
        Activity.hasMany(models.Participation, {
            foreignKey: 'activity_id',
            as: 'participations',
        });
    }

    return Activity;
};
