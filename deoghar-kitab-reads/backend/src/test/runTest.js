const connectDB = require('../config/db');
const testDatabase = require('./databaseTest');

// Connect to database
connectDB().then(() => {
  // Run database test
  testDatabase().then(() => {
    console.log('Database test completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}).catch((error) => {
  console.error('Database connection failed:', error);
  process.exit(1);
});