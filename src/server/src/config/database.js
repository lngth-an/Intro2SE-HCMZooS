// config/database.js
const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        ca: fs
          .readFileSync(path.resolve(__dirname, "..", process.env.DB_SSL_CA))
          .toString(),
        rejectUnauthorized: true,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  }
);

module.exports = sequelize;
