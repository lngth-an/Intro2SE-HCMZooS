module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
        studentID: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        userID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'userID',
              },
        },
        sex: {
            type: DataTypes.STRING,
        },
        dateOfBirth: {
            type: DataTypes.DATE,
        },
        academicYear: {
            type: DataTypes.STRING,
        },
        falculty: {
            type: DataTypes.STRING,
        },
        point: {
            type: DataTypes.INTEGER,
        },
    },{
        tableName: 'students',
        timestamps: false, // createdAt, updatedAt
    });

    Student.associate = (models) => {
        Student.belongsTo(models.User, {
            foreignKey: 'userID',
            as: 'user',
        });

        Student.hasMany(models.Participation, {
            foreignKey: 'studentID',
            as: 'participations',
        });
    };

    return Student;
};
