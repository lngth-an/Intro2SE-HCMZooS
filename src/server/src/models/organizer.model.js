module.exports = (sequelize, DataTypes) => {
    const Organizer = sequelize.define('Organizer', {
        organizerID: {
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
        department: {
            type: DataTypes.STRING,
        },

    },{
        tableName: 'organizers',
        timestamps: false, // createdAt, updatedAt
    });

    Organizer.associate = (models) => {
        Organizer.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });

        Organizer.hasMany(models.Activity, {
            foreignKey: 'organizer_id',
            as: 'activities',
        });
    }

    return Organizer;
};