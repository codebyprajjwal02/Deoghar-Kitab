const { User } = require('../models');

// Test database connection and user creation
const testDatabase = async () => {
  try {
    console.log('Testing database connection...');
    
    // Create a test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      userType: 'user'
    });
    
    const savedUser = await testUser.save();
    console.log('User created successfully:', savedUser);
    
    // Retrieve all users
    const users = await User.find({});
    console.log('All users:', users);
    
    // Clean up - delete the test user
    await User.deleteOne({ _id: savedUser._id });
    console.log('Test user deleted');
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
};

module.exports = testDatabase;