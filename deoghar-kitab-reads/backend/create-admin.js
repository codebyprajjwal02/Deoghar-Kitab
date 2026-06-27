const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./src/models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/deoghar_kitab');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    await connectDB();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'sprajjwalsingh230@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create a new admin user with the specified credentials
    const adminUser = new User({
      name: 'Admin User',
      email: 'sprajjwalsingh230@gmail.com',
      password: '123456', // This will be hashed by the pre-save middleware
      userType: 'admin'
    });
    
    const savedUser = await adminUser.save();
    console.log('Admin user created successfully:', savedUser);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();