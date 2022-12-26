import axios from 'axios';
import { CLIENT_ID, CLIENT_SECRET } from './constants';
import { queryParamsStringify } from './utils';

export const refreshAccessToken = async (refresh_token: string): Promise<string> => {
  return axios
    .post(
      'https://accounts.spotify.com/api/token',
      {
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      },
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),

          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    .then((response) => {
      console.log(response.data);
      return response.data.access_token;
    });
};

export const fetchRecentlyPlayed = async (accessToken: string): Promise<string[] | void> => {
  return axios
    .get<SpotifyApi.UsersRecentlyPlayedTracksResponse>(
      `https://api.spotify.com/v1/me/player/recently-played?${queryParamsStringify({
        limit: '50',
      })}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    .then((response) => {
      const song_titles = response.data.items.map((item) => item.track.name);
      return song_titles;
    })
    .catch((err) => console.log(err));
};

export const fetchCurrentlyPlayed = async (accessToken: string) => {
  return axios
    .get<SpotifyApi.CurrentlyPlayingResponse>(
      'https://api.spotify.com/v1/me/player/currently-playing',

      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    .then((response) => {
      if (response.status === 204) {
        return {
          status: 204,
          msg: 'No Content',
        };
      } else if (response.data.currently_playing_type === 'track') {
        const item = response.data.item as SpotifyApi.TrackObjectFull;
        console.log(item.name);
        item.artists.forEach((artist) => console.log(artist.name));
        console.log(item.album.images);
        console.log(item.preview_url);
        return {
          status: 200,
          name: item.name,
          artists: item.artists.map((artist) => artist.name),
          albumImages: item.album.images,
          previewUrl: item.preview_url,
        };
      } else {
        return {
          status: 200,
          msg: 'Playing episode',
        };
      }
    });
};
