const mongoose = require('mongoose');

/**
 * Connect to MongoDB database with automated local/in-memory fallbacks
 */
const connectDB = async () => {
  const atlasUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://localhost:27017/midis_blog';

  if (!atlasUri) {
    console.warn('MONGODB_URI not defined. Trying local MongoDB...');
  }

  // 1. Try connecting to MongoDB Atlas
  if (atlasUri) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(atlasUri, {
        serverSelectionTimeoutMS: 5000 // Fast fail in 5s if IP is blocked
      });
      console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`Atlas connection failed: ${error.message}`);
      console.log('Attempting local MongoDB fallback...');
    }
  }

  // 2. Try connecting to Local MongoDB
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`Local MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed: ${error.message}`);
    console.warn('------------------------------------------------------------');
    console.warn('WARNING: Running in Standalone Offline Mode (In-Memory Auth).');
    console.warn('All CMS data will use default fallback credentials.');
    console.warn('------------------------------------------------------------');

    // Disconnect Mongoose to prevent query buffering/hanging
    await mongoose.disconnect().catch(() => { });
  }
};

module.exports = connectDB;
