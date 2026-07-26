require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  await connectDB();

  try {
    const existingAdmin = await Admin.findOne({ email: 'admin@creativegiftart.com' });

    if (existingAdmin) {
      console.log('⚠️  Default admin already exists. Skipping.');
      process.exit(0);
    }

    const admin = await Admin.create({
      name: 'Creative Gift Art',
      email: 'admin@creativegiftart.com',
      password: 'Admin@123',
      role: 'superadmin',
    });

    console.log('✅ Default admin created:');
    console.log(`   Name  : ${admin.name}`);
    console.log(`   Email : ${admin.email}`);
    console.log(`   Role  : ${admin.role}`);
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
  } catch (error) {
    console.error('❌ Admin seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

seedAdmin();
