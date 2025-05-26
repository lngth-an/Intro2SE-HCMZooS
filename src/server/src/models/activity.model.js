module.exports = (sequelize, DataTypes) => {
    const Activity = sequelize.define('Activity', {
        activity_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        semester_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'semesters',
                key: 'semester_id',
            },
        },
        organizer_id: {
            type: DataTypes.STRING,
            references: {
                model: 'organizers',
                key: 'organizer_id'
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
        activity_status: {
            type: DataTypes.STRING,
        },
        registration_start_date: {
            type: DataTypes.DATE,
        },
        registration_end_date: {
            type: DataTypes.DATE,
        },
        event_start_date: {
            type: DataTypes.DATE,
        },
        event_end_date: {
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
