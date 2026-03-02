import express from 'express';
import cors from 'cors';
import { completionRoutes } from '#routes';
import { errorHandler, notFoundHandler } from '#middleware';
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
const app = express();
const port = process.env.PORT || '5050';

app.use(cors({ origin: '*' }), express.json());

app.use('/ai', completionRoutes);

app.use('*splat', notFoundHandler);
app.use(errorHandler);

app.listen(port, () => console.log(`\x1b[35mApp listening at http://localhost:${port}\x1b[0m`));
