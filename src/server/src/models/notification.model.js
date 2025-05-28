module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        notificationID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fromUserID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'userID',
            }
        },
        toUserID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'userID',
            }
        },
        notificationTitle: {
            type: DataTypes.STRING,
        },
        notificationMessage: {
            type: DataTypes.TEXT,
        },
        notificationStatus: {
            type: DataTypes.STRING,
        },
    },{
        tableName: 'notifications',
        timestamps: false, // createdAt, updatedAt
    });

    
    return Notification;
};

