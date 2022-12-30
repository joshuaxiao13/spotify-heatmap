import express from 'express';
import mongoose from 'mongoose';
import { SERVER_PORT as PORT } from './constants';
import user from './routes/user';
import updateAllUsers from './scripts/updateAllHistory';

const app = express();

app.use(express.json());
app.use('/', user);

const start = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI!);
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT} ...`);
    });
    // update every 10 minutes
    updateAllUsers();
    setInterval(updateAllUsers, 10 * 60 * 1000);
  } catch (err) {
    console.log('failed to connect to DB');
  }
};

start();
