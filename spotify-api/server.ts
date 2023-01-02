/**
 * TODO: DELETE THIS FILE WHEN FINISHED
 * AND npm uninstall cors and @types/cors
 */

import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import user from './routes/user';
import updateAllUsers from './scripts/updateAllHistory';
import cors from 'cors';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api/v1', user);

const PORT = 8000;

const start = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI!);
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT} ...`);
    });
    // update every 15 minutes
    updateAllUsers();
    setInterval(updateAllUsers, 15 * 60 * 1000);
  } catch (err) {
    console.log('failed to connect to DB');
  }
};

start();
