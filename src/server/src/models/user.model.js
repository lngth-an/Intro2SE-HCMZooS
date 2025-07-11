module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userID: {
      type: DataTypes.INTEGER,       // đổi thành INTEGER nếu muốn autoIncrement
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
  }, {
    tableName: 'users',
    timestamps: false, // createdAt, updatedAt
  });

  User.associate = (models) => {
    User.hasOne(models.Student, {
      foreignKey: 'userID',
      as: 'student',
    });
    User.hasOne(models.Organizer, {
      foreignKey: 'userID',
      as: 'organizer',
    });
  };

  return User;
};
