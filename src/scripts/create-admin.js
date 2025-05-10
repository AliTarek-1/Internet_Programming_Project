/**
 * Script to create an admin user for testing
 * Run with: node src/scripts/create-admin.js
 */

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jwt-auth')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`Email: admin@example.com`);
      console.log(`AdminID: ${existingAdmin.adminID}`);
      console.log('You can login with these credentials:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123456');
      process.exit(0);
    }
    
    // Generate a unique admin ID
    const adminCount = await Admin.countDocuments();
    const adminID = `ADM${(adminCount + 1).toString().padStart(4, '0')}`;
    
    // Create admin user
    const admin = new Admin({
      adminID,
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123456',
      role: 'admin'
    });
    
    await admin.save();
    
    console.log('Admin user created successfully:');
    console.log(`Email: admin@example.com`);
    console.log(`AdminID: ${adminID}`);
    console.log('You can login with these credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123456');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
