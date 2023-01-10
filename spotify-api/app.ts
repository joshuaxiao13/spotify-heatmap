import * as dotenv from 'dotenv';
dotenv.config();

import { PORT } from './constants';
import auth from './routes/auth';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import updateAllUsers from './scripts/updateAllHistory';
import user from './routes/user';

const app = express();

app.use(express.json());
app.use('/api/v1', user);

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use('/', auth);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
});

const start = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI!);
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT} ...`);
    });
    updateAllUsers();
    setInterval(updateAllUsers, 50 * 60 * 1000);
  } catch (err) {
    console.log('failed to connect to DB');
  }
};

start();
