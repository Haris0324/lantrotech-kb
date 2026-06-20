require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Update all current users to have the admin role
    const result = await User.updateMany({}, { $set: { role: 'admin' } });
    
    console.log(`Successfully updated ${result.modifiedCount} users to 'admin' role.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

makeAdmin();
