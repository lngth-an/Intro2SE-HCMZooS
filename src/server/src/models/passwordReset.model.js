module.exports = (sequelize, DataTypes) => {
    const PasswordReset = sequelize.define('PasswordReset', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'userID'
        }
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'password_resets',
      timestamps: true
    });
  
    PasswordReset.associate = (models) => {
      PasswordReset.belongsTo(models.User, {
        foreignKey: 'userID',
        as: 'user'
      });
    };
  
    return PasswordReset;
  }; 