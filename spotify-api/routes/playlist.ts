import { Router } from 'express';
import { getPlaylistItemsByPlaylistID } from '../controllers/youtubePlaylist';

const router = Router();

router.route('/playlist').get(getPlaylistItemsByPlaylistID);

export default router;
