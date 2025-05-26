module.exports = (sequelize, DataTypes) => {
    const Participation = sequelize.define('Participation', {
        participation_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        activity_id: {
            type: DataTypes.INTEGER,
            references: {   
                model: 'activities',
                key: 'activity_id',
            },
        },
        student_id: {   
            type: DataTypes.STRING,
            references: {
                model: 'Students',
                key: 'student_id',
            },
        },
        participation_status: {
            type: DataTypes.STRING,
        },
        training_point: {
            type: DataTypes.INTEGER,
        },
        type: {
            type: DataTypes.STRING,
        },
    },{
        tableName: 'participations',
        timestamps: false, // createdAt, updatedAt
    });

    Participation.associate = (models) => {
        Participation.belongsTo(models.Activity, {
            foreignKey: 'activity_id',
            as: 'activity',
        });
        Participation.belongsTo(models.Student, {
            foreignKey: 'student_id',
            as: 'student',
        });
        Participation.hasMany(models.Complaint, {
            foreignKey: 'participation_id',
            as: 'complaints',
        });
    };
    
    return Participation;
};
    
