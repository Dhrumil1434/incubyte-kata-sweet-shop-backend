import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const uri = process.env['MONGO_URI'];

  if (!uri) {
    console.error('❌ MONGO_URI not found in environment variables.');
    process.exit(1);
  }
  try {
    const { connection } = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${connection.host}`);
    return connection;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};

export default connectDB;
