import express from 'express';
import path from 'path';
import { APP_PORT as PORT } from './constants';
import auth from './routes/auth';

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use('/', auth);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT} ...`);
});
