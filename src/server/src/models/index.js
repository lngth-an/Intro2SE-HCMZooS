const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        // require: true,
        // ca: fs.readFileSync(path.resolve(__dirname, '..', process.env.DB_SSL_CA)).toString(),
        rejectUnauthorized: false
      },
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const db = { sequelize, Sequelize };

// Load các model trong thư mục hiện tại
fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.model.js'))
  .forEach(file => {
    const modelPath = path.join(__dirname, file);
    let model;

    try {
      model = require(modelPath)(sequelize, DataTypes);
    } catch (err) {
      console.error(`❌ Lỗi khi load model từ file "${file}":`, err);
      return;
    }

    if (!model || !model.name) {
      console.error(`❌ Model trong file "${file}" không hợp lệ hoặc không trả về đối tượng Sequelize!`);
      return;
    }

    console.log(`✅ Load model: ${model.name} từ file ${file}`);
    db[model.name] = model;
  });

// Gọi associate nếu model có khai báo
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;