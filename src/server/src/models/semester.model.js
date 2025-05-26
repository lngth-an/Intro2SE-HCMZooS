module.exports = (sequelize, DataTypes) => {
    const Semester = sequelize.define('Semester', {
        semester_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        semester_name: {
            type: DataTypes.STRING,
        },
        semester_start_date: {
            type: DataTypes.DATE,
        },
        semester_end_date: {
            type: DataTypes.DATE,
        },
    },{
        tableName: 'semesters',
        timestamps: false, // createdAt, updatedAt
    });

    Semester.associate = (models) => {
        Semester.hasMany(models.Activity, {
            foreignKey: 'semester_id',
            as: 'activities',
        });
    }

    return Semester;
};
