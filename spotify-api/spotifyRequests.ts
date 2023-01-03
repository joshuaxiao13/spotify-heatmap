import axios from 'axios';
import { CLIENT_ID, CLIENT_SECRET } from './constants';
import { queryParamsStringify } from './utils';

export interface UserProfileResponse {
  display_name: string | undefined;
  id: string;
  images: SpotifyApi.ImageObject[] | undefined;
  user_url: string;
}

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
      return response.data.access_token;
    })
    .catch((err) => {
      throw err;
    });
};

export const fetchUserProfile = async (accessToken: string): Promise<UserProfileResponse> => {
  console.log(accessToken);
  return axios
    .get<SpotifyApi.CurrentUsersProfileResponse>('https://api.spotify.com/v1/me/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      const {
        display_name,
        id,
        images,
        external_urls: { spotify },
      } = response.data;

      const profile: UserProfileResponse = {
        display_name,
        id,
        images,
        user_url: spotify,
      };

      return profile;
    })
    .catch((err) => {
      throw err;
    });
};

export interface Track {
  name: string;
  artists: string[];
  duration_ms: number;
  uri: string;
  url: string;
  played_at: Date;
}

export const fetchRecentlyPlayed = async (accessToken: string): Promise<Track[]> => {
  return axios
    .get<SpotifyApi.UsersRecentlyPlayedTracksResponse>(
      queryParamsStringify('https://api.spotify.com/v1/me/player/recently-played', { limit: '50' }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    .then((response) => {
      const tracks: Track[] = response.data.items.map(
        (item: SpotifyApi.PlayHistoryObject): Track => ({
          name: item.track.name,
          artists: item.track.artists.map((artist) => artist.name),
          duration_ms: item.track.duration_ms,
          uri: item.track.uri,
          url: item.track.external_urls.spotify,
          played_at: new Date(item.played_at),
        })
      );
      return tracks;
    })
    .catch((err) => {
      throw err;
    });
};

export interface CurrentlyPlayingResponse {
  msg: string;
  name?: string;
  artists?: string[];
  albumImages?: SpotifyApi.ImageObject[];
  previewUrl?: string | null;
}

export const fetchCurrentlyPlayed = async (accessToken: string): Promise<CurrentlyPlayingResponse> => {
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
          msg: 'No Content',
        };
      } else if (response.data.currently_playing_type === 'track') {
        const item = response.data.item as SpotifyApi.TrackObjectFull;
        console.log(item.name);
        item.artists.forEach((artist) => console.log(artist.name));
        console.log(item.album.images);
        console.log(item.preview_url);
        return {
          msg: 'Playing track',
          name: item.name,
          artists: item.artists.map((artist) => artist.name),
          albumImages: item.album.images,
          previewUrl: item.preview_url,
        };
      } else {
        return {
          msg: 'Playing episode',
        };
      }
    })
    .catch((err) => {
      throw err;
    });
};
