// src/db.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set in environment');
    throw new Error('MONGO_URI not set');
  }

  try {
    // Connect using supported options only
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB_NAME || undefined,
      // recommended tuning options (supported):
      // serverSelectionTimeoutMS: 5000,
      // maxPoolSize: 10,
    });

    console.log('✅ MongoDB connected');
  } catch (err) {
    // Log full error and rethrow so index.js can decide what to do
    console.error('❌ MongoDB Connection Error:', err);
    throw err;
  }
};
console.log("MONGO_URI (used):", process.env.MONGO_URI);
