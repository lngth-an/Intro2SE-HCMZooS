module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        notification_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        from_user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'user_id',
            }
        },
        to_user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'user_id',
            }
        },
        notification_title: {
            type: DataTypes.STRING,
        },
        notification_message: {
            type: DataTypes.TEXT,
        },
        notification_status: {
            type: DataTypes.STRING,
        },
    },{
        tableName: 'notifications',
        timestamps: false, // createdAt, updatedAt
    });

    
    return Notification;
};

