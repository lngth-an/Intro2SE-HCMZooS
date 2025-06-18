module.exports = (sequelize, DataTypes) => {
    const Participation = sequelize.define('Participation', {
        participationID:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        activityID: {
            type: DataTypes.INTEGER,
            references: {   
                model: 'activities',
                key: 'activityID',
            },
        },
        studentID: {   
            type: DataTypes.STRING,
            references: {
                model: 'students',
                key: 'studentID',
            },
        },
        participationStatus: {
            type: DataTypes.STRING,
        },
        trainingPoint: {
            type: DataTypes.INTEGER,
        },
    },{
        tableName: 'participations',
        timestamps: false, // createdAt, updatedAt
    });

    Participation.associate = (models) => {
        Participation.belongsTo(models.Activity, {
            foreignKey: 'activityID',
            as: 'activity',
        });
        Participation.belongsTo(models.Student, {
            foreignKey: 'studentID',
            as: 'student',
        });
        Participation.hasMany(models.Complaint, {
            foreignKey: 'participationID',
            as: 'complaints',
        });
    };
    
    return Participation;
};
    
