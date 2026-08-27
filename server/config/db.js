import mongoose from 'mongoose';

/**
 * Establishes the MongoDB Atlas connection.
 *
 * Called once at server startup, before app.listen().
 * Exits the process with code 1 on any failure so the server
 * never silently runs without a working database connection.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[DB] MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000, // fail fast instead of hanging 30 s
    });
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
