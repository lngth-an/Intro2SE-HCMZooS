module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
        student_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'user_id',
              },
        },
        sex: {
            type: DataTypes.STRING,
        },
        date_of_birth: {
            type: DataTypes.DATE,
        },
        academic_year: {
            type: DataTypes.STRING,
        },
        falculty: {
            type: DataTypes.STRING,
        },
    },{
        tableName: 'students',
        timestamps: false, // createdAt, updatedAt
    });

    Student.associate = (models) => {
        Student.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });

        Student.hasMany(models.Participation, {
            foreignKey: 'student_id',
            as: 'participations',
        });
    };

    return Student;
};
