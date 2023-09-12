import axios, { AxiosError, HttpStatusCode } from 'axios';
import { CLIENT_ID, CLIENT_SECRET, API_KEY } from './constants';
import { flatten, queryParamsStringify } from './utils';

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
  spotify_id: string;
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
          spotify_id: item.track.id,
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

export const fetchTracksBySpotifyId = async (
  accessToken: string,
  spotify_ids: string[]
): Promise<SpotifyApi.MultipleTracksResponse> => {
  // maximum 50 ids per request
  return axios
    .get<SpotifyApi.MultipleTracksResponse>(
      queryParamsStringify('https://api.spotify.com/v1/tracks', {
        ids: spotify_ids.join(','),
      }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

export const fetchArtistImagesBySpotifyId = async (
  accessToken: string,
  spotify_artist_ids: string[][]
): Promise<SpotifyApi.ImageObject[][][]> => {
  // maximum 50 ids per request
  const flattened: string[] = flatten<string>(spotify_artist_ids);
  return axios
    .get<SpotifyApi.MultipleArtistsResponse>(
      queryParamsStringify('https://api.spotify.com/v1/artists', {
        ids: flattened.join(','),
      }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((response) => {
      const artists = response.data.artists;
      let trackCounter = -1;
      return artists.reduce<SpotifyApi.ImageObject[][][]>((acc, artistObject) => {
        if (trackCounter === -1 || acc[trackCounter]!.length + 1 > spotify_artist_ids[trackCounter]!.length) {
          ++trackCounter;
          acc.push([]);
        }
        acc[trackCounter]!.push(artistObject.images);
        return acc;
      }, []);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

export interface SpotifyYoutubeTrackMapping {
  youtube: {
    name: string;
  };
  spotify?: {
    name: string;
    uri: string;
  };
}
const fetchSingleSpotifyTrackByYoutubePlaylistURL = (
  accessToken: string,
  playlistTitle: { title: string },
  maxRetries: number = 3,
  currentRetry: number = 0
): Promise<SpotifyYoutubeTrackMapping> => {
  return axios
    .get<SpotifyApi.SearchResponse>(
      queryParamsStringify('https://api.spotify.com/v1/search', {
        q: playlistTitle.title,
        type: 'track',
        limit: '1',
      }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((response) => {
      // item limit is 1 above
      const SpotifyTrackInfo: SpotifyYoutubeTrackMapping | undefined = response.data.tracks?.items.map((track) => {
        return {
          youtube: {
            name: playlistTitle.title,
          },
          spotify: {
            uri: track.uri,
            name: track.name,
          },
        };
      })[0];

      if (SpotifyTrackInfo === undefined) {
        throw new Error('No spotify track found for video with name ' + playlistTitle.title);
      }

      return SpotifyTrackInfo;
    })
    .catch((err: AxiosError) => {
      if (err.response?.status === HttpStatusCode.TooManyRequests) {
        if (currentRetry < maxRetries) {
          // Retry the request after a delay
          const retryDelayMs = parseInt((err.response!.headers['retry-after'] as string) ?? 10) * 1000;
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(
                fetchSingleSpotifyTrackByYoutubePlaylistURL(accessToken, playlistTitle, maxRetries, currentRetry + 1)
              );
            }, retryDelayMs);
          });
        } else {
          // Max retries reached,
          return {
            youtube: {
              name: playlistTitle.title,
            },
          };
        }
      } else {
        // Can't find a corresponding track for the youtube video
        return {
          youtube: {
            name: playlistTitle.title,
          },
        };
      }
    });
};

function partitionArray<T>(arr: T[], chunkSize: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

export const fetchSpotifyTracksByYoutubePlaylistID = (
  accessToken: string,
  youtubePlaylistID: string
): Promise<SpotifyYoutubeTrackMapping[]> => {
  return axios
    .get<{ id: string; playlistTitles: { title: string }[] }>(
      queryParamsStringify(`${API_KEY}/playlist`, {
        id: youtubePlaylistID,
      })
    )
    .then(async (response) => {
      // batch requests, don't do all at once
      const BATCH_SIZE = 50;
      const partitions = partitionArray(response.data.playlistTitles, BATCH_SIZE);

      let spotifyTrackInfoForTitles: SpotifyYoutubeTrackMapping[] = [];
      for (const chunk of partitions) {
        //  fullfill the 50 promises before going onto the next batch
        const fetchIntermediateResult = await Promise.all(
          // todo: Do some preprocessing on the titleOnPlaylist string
          // for example, remove words that grep with (official music video)
          chunk.map((titleOnPlaylist) => fetchSingleSpotifyTrackByYoutubePlaylistURL(accessToken, titleOnPlaylist))
        );
        spotifyTrackInfoForTitles.push(...fetchIntermediateResult);
      }

      return spotifyTrackInfoForTitles;
    })
    .catch(() => {
      throw new Error('Possible error from external service.');
    });
};

export interface CreateSpotifyPlaylistResponse {
  spotifyPlaylistID: string;
  spotifyPlaylistURL: string;
}
const createSpotifyPlaylist = (accessToken: string, userSpotifyID: string): Promise<CreateSpotifyPlaylistResponse> => {
  return axios
    .post<SpotifyApi.CreatePlaylistResponse>(
      `https://api.spotify.com/v1/users/${userSpotifyID}/playlists`,
      {
        // todo: get the actual youtube playlist name
        name: 'Spotify Heatmap ' + new Date().toLocaleDateString(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    .then((response) => {
      return { spotifyPlaylistID: response.data.id, spotifyPlaylistURL: response.data.external_urls.spotify };
    })
    .catch(() => {
      throw new Error('Could not create new user playlist.');
    });
};

const appendTracksToSpotifyPlaylist = (accessToken: string, spotifyPlaylistID: string, spotifyURIList: string[]) => {
  return axios
    .post<SpotifyApi.AddTracksToPlaylistResponse>(
      `https://api.spotify.com/v1/playlists/${spotifyPlaylistID}/tracks`,
      {
        uris: spotifyURIList,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    .catch(() => {
      throw new Error('Could not append tracks to spotify playlist.');
    });
};

export const createSpotifyPlaylistFromSpotifyURIs = async (
  accessToken: string,
  userSpotifyID: string,
  spotifyURIList: SpotifyYoutubeTrackMapping[]
): Promise<CreateSpotifyPlaylistResponse> => {
  const spotifyPlaylistInfo = await createSpotifyPlaylist(accessToken, userSpotifyID);

  const notFoundTracks: string[] = [];
  const foundTracks: Required<SpotifyYoutubeTrackMapping>[] = [];

  for (const track of spotifyURIList) {
    if (track.spotify === undefined) {
      notFoundTracks.push(track.youtube.name);
    } else {
      const spotify = track.spotify;
      const youtube = track.youtube;
      foundTracks.push({ spotify, youtube });
    }
  }

  if (notFoundTracks.length > 0) {
    const songList = notFoundTracks.join('\n');
    // if there is at least one track that cannot be found, display msg detailing all songs that couldn't be found
    alert('Cannot find the following songs:\n\n' + songList);
  }

  // The Spotify API Docs state that 100 is the max number of songs in a single add to playlist request: https://developer.spotify.com/documentation/web-api/reference/add-tracks-to-playlist#:~:text=spotify%3Aepisode%3A512ojhOuo1ktJprKbVcKyQ-,A%20maximum%20of%20100%20items%20can%20be%20added%20in%20one%20request.,-Note%3A%20it%20is
  const MAX_TRACKS_PER_REQUEST = 100;
  const partitions = partitionArray(foundTracks, MAX_TRACKS_PER_REQUEST);

  for (const chunk of partitions) {
    //  fullfill the MAX_TRACKS_PER_REQUEST promises before going onto the next batch
    try {
      const spotifyURIList: string[] = chunk.map(({ spotify: { uri } }) => uri);
      await appendTracksToSpotifyPlaylist(accessToken, spotifyPlaylistInfo.spotifyPlaylistID, spotifyURIList);
    } catch {
      const songList = String(chunk.map(({ youtube: { name } }) => name).join('\n'));
      alert('Could not append the following tracks to spotify playlist:\n\n' + songList);
    }
  }

  return spotifyPlaylistInfo;
};
