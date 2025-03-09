const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('MongoDB connection string not found in environment variables. Exiting process...');
      process.exit(1); // process.exit(1) is used to exit the process with a failure code.
    }

    // Connect to MongoDB with the provided URI
    await mongoose.connect(mongoURI);

    console.log('MongoDB Connected Successfully!');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1); //  Also exit if there is a connection error
  }
};

module.exports = connectDB;
