// import mongoose from 'mongoose';
// try {
//   const MONGO_URI = process.env.MONGO_URI;
//   if (!MONGO_URI) throw new Error('Missing MONGO_URI in .env file');
//   await mongoose.connect(MONGO_URI, {
//     dbName: process.env.DB_NAME
//   });
//   console.log('\x1b[35mMongoDB connected via Mongoose\x1b[0m');
// } catch (error) {
//   console.error('MongoDB connection error:', error);
//   process.exit(1);
// }

import mongoose from 'mongoose';

async function connectDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error('Missing MONGO_URI in .env file');

    await mongoose.connect(MONGO_URI, {
      dbName: process.env.DB_NAME
    });
    console.log('\x1b[35mMongoDB connected via Mongoose\x1b[0m');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

connectDB();
