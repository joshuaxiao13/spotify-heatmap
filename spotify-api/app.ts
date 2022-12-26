import express from 'express';
import path from 'path';
import router from './routes/auth';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use('/', router);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT} ...`);
});
