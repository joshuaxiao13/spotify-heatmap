import { Request, Response } from 'express';
import { google, youtube_v3 } from 'googleapis';
import { GOOGLE_CLIENT_SECRET } from '../constants';

type YoutubePlaylistItem = {
  title: string;
};

/**
 * A manager class for handling requests to the youtube playlists api
 */
class YoutubePlaylistManager {
  private youtube_v3API: youtube_v3.Youtube;

  constructor() {
    this.youtube_v3API = google.youtube({
      version: 'v3',
      auth: GOOGLE_CLIENT_SECRET,
    });
  }

  /**
   * Get a list of items in the playlist. We have imposed a limit of ~500 items to retreive from the playlist.
   * This limit handles the case where the user inputs a url that is really a mix or mixtape (which has infinite pages).
   *
   * @param id: The playlist id for the youtube playlist, in the 'list' param of the palylist url
   * @returns A list containing the title of each item in the playlist
   */
  public async getPlaylistData(id: string): Promise<YoutubePlaylistItem[]> {
    const playlistItems: YoutubePlaylistItem[] = [];
    let nextPageToken: string | undefined | null;

    do {
      const youtubeAPI_PlaylistItems_res = await this.youtube_v3API.playlistItems.list({
        part: ['snippet'],
        playlistId: id,
        pageToken: nextPageToken ?? undefined,
      });

      if (youtubeAPI_PlaylistItems_res.data.items !== undefined) {
        youtubeAPI_PlaylistItems_res.data.items.forEach((item) => {
          if (item.snippet?.title !== undefined && item.snippet?.title !== null) {
            playlistItems.push({ title: item.snippet.title });
          }
        });
      }

      nextPageToken = youtubeAPI_PlaylistItems_res.data.nextPageToken;
    } while (nextPageToken !== undefined && nextPageToken !== null && playlistItems.length < 500);

    return playlistItems;
  }
}

const youtubePlaylistManager = new YoutubePlaylistManager();

export async function getPlaylistItemsByPlaylistID(
  req: Request<{}, any, {}, { id: string }>,
  res: Response
): Promise<void> {
  try {
    const youtubePlaylistData = await youtubePlaylistManager.getPlaylistData(req.query.id);
    res.status(200).json({ id: req.query.id, playlistTitles: youtubePlaylistData });
  } catch (err) {
    res.status(404).json(err);
  }
}
