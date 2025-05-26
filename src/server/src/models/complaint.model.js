module.exports = (sequelize, DataTypes) => {
    const Complaint = sequelize.define('Complaint', {
        complaint_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        participation_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'participations',
                key: 'participation_id',
            },
        },
        description: {
            type: DataTypes.TEXT,
        },
        complaint_status: {
            type: DataTypes.STRING,
        },
        response: {
            type: DataTypes.TEXT,
        }
    },{
        tableName: 'complaints',
        timestamps: false, // createdAt, updatedAt
    });

    Complaint.associate = (models) => {
        Complaint.belongsTo(models.Participation, {
            foreignKey: 'participation_id',
            as: 'participation',
        });
    }
    
    return Complaint;
};


