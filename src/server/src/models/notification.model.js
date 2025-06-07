module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        notificationID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fromUserID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'userID'
            }
        },
        toUserID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'userID'
            }
        },
        notificationTitle: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        notificationMessage: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        notificationStatus: {
            type: DataTypes.STRING(255),
            defaultValue: 'unread',
            validate: {
                isIn: [['unread', 'read']]
            }
        }
    }, {
        tableName: 'notifications',
        timestamps: false,
    });

    Notification.associate = (models) => {
        Notification.belongsTo(models.User, {
            foreignKey: 'fromUserID',
            as: 'fromUser'
        });
        Notification.belongsTo(models.User, {
            foreignKey: 'toUserID',
            as: 'toUser'
        });
    };

    return Notification;
};

