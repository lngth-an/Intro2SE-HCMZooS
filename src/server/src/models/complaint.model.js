module.exports = (sequelize, DataTypes) => {
    const Complaint = sequelize.define('Complaint', {
        complaintID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        participationID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'participations',
                key: 'participationID',
            },
        },
        description: {
            type: DataTypes.TEXT,
        },
        complaintStatus: {
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
            foreignKey: 'participationID',
            as: 'participation',
        });
    }
    
    return Complaint;
};


