require('dotenv').config();
const db = require('../models');
const bcrypt = require('bcryptjs');

async function hashAllPasswords() {
  try {
    // Kiểm tra kết nối database
    await db.sequelize.authenticate();
    console.log('Kết nối database thành công');

    // Lấy tất cả users
    const users = await db.User.findAll();
    console.log(`Found ${users.length} users to update`);

    // Hash password cho từng user
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      // Cập nhật password đã hash
      await user.update({ password: hashedPassword });
      console.log(`Updated password for user: ${user.email}`);
    }

    console.log('Successfully hashed all passwords');
    process.exit(0);
  } catch (error) {
    console.error('Error hashing passwords:', error);
    process.exit(1);
  }
}

// Chạy script
hashAllPasswords(); 