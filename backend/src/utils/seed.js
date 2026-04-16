require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      await mongoose.disconnect();
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@internix.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log(`Admin created: ${admin.email} / admin123`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedAdmin();
