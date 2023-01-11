/**
 * For developement purposes to not build frontend everytime we start the server
 */
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import user from './routes/user';
import updateAllUsers from './scripts/updateAllHistory';
import cors from 'cors';
import { DEV_SEVER_PORT } from './constants';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api/v1', user);

const PORT = DEV_SEVER_PORT;

const start = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI!);
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT} ...`);
    });
    updateAllUsers();
    setInterval(updateAllUsers, 5 * 60 * 1000);
  } catch (err) {
    console.log('failed to connect to DB');
  }
};

start();
