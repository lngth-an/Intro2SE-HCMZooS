require('dotenv').config();

const db = require('./models');

db.sequelize.sync({ force: true, alter: true })  // hoặc { force: true } nếu muốn xóa bảng và tạo lại, alter: true để tự động đúng thứ tự
  .then(() => {
    console.log('✅ Các bảng đã được tạo thành công!');
    process.exit();  // Thoát sau khi tạo bảng xong (nếu bạn không chạy server web)
  })
  .catch((err) => {
    console.error('❌ Lỗi khi tạo bảng:', err);
  });
