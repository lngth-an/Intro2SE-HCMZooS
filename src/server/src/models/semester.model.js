module.exports = (sequelize, DataTypes) => {
    const Semester = sequelize.define('Semester', {
        semesterID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        semesterName: {
            type: DataTypes.STRING,
        },
        semesterStart: {
            type: DataTypes.DATE,
        },
        semesterEnd: {
            type: DataTypes.DATE,
        },
    },{
        tableName: 'semesters',
        timestamps: false, // createdAt, updatedAt
    });

    Semester.associate = (models) => {
        Semester.hasMany(models.Activity, {
            foreignKey: 'semesterID',
            as: 'activities',
        });
    }

    return Semester;
};
