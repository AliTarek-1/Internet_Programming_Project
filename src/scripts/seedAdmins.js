/**
 * Seed script to populate the database with admin users
 */

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brandstore')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample admin data
const admins = [
  {
    adminID: 'ADMIN001',
    name: 'John Doe',
    email: 'john.doe@brandstore.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    adminID: 'ADMIN002',
    name: 'Jane Smith',
    email: 'jane.smith@brandstore.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    adminID: 'SADMIN001',
    name: 'Admin Master',
    email: 'admin.master@brandstore.com',
    password: 'SuperAdmin123!',
    role: 'superadmin'
  }
];

// Function to seed the database
async function seedAdmins() {
  try {
    // Clear existing admins
    await Admin.deleteMany({});
    console.log('Cleared existing admins');

    // Insert new admins
    const result = await Admin.create(admins);
    console.log(`Successfully added ${result.length} admins to the database`);

    // Log the breakdown by role
    const adminCount = result.filter(a => a.role === 'admin').length;
    const superAdminCount = result.filter(a => a.role === 'superadmin').length;

    console.log(`Regular Admins: ${adminCount}`);
    console.log(`Super Admins: ${superAdminCount}`);

    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding admins:', error);
    mongoose.connection.close();
  }
}

// Run the seeding function
seedAdmins();
