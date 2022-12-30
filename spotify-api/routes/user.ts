import { Router } from 'express';
import { deleteUser, getUserHistory, loginUser, updateHistory } from '../controllers/users';

const router = Router();

router.route('/user').get(getUserHistory).post(loginUser).patch(updateHistory).delete(deleteUser);

export default router;
