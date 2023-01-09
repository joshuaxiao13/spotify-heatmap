import axios, { AxiosResponse } from 'axios';
import { API_KEY } from './constants';
import { DayLookup } from './models/user';
import {
  CurrentlyPlayingResponse,
  fetchArtistImagesBySpotifyId,
  fetchCurrentlyPlayed,
  fetchRecentlyPlayed,
  fetchTracksBySpotifyId,
  fetchUserProfile,
  refreshAccessToken,
  Track,
  UserProfileResponse,
} from './spotifyRequests';
import { queryParamsStringify } from './utils';

export default class SpotifyUser {
  private access_token: string;
  private readonly refresh_token: string;
  readonly profile: Promise<UserProfileResponse>;

  /**
   * @constructor SpotifyUser object represents the user and its private access/refresh keys
   * @param access_token - access token produced in /callback redirect
   * @param refresh_token - refresh token produced in /callback redirect
   */
  constructor(access_token: string, refresh_token: string) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
    this.profile = fetchUserProfile(this.access_token);

    this.profile.then((profile) => {
      const updateListeningHistory = async (access_token: string): Promise<void> => {
        return axios.patch(`${API_KEY}/user?id=${profile.id}`, undefined, {
          headers: {
            Authorization: access_token,
            'Content-Type': 'application/json',
          },
        });
      };
      this.run(updateListeningHistory);
    });
  }

  /**
   * Returns a promise representing the Spotify request, requires Spotify access token, and pass refresh token to handle case
   * where access token is expired
   * @param access_token - the user access token
   * @param refresh_token - the refresh token to generate new access code
   * @param generatePromise - a function that consumes access token and returns the desired request as a promise
   */
  private async run<T>(generatePromise: (access_token: string) => Promise<T>): Promise<T> {
    return generatePromise(this.access_token).catch(async (err: any) => {
      console.log('error:', err);
      switch (err.response.data.error?.message || err.response.data.error) {
        /**
         * TODO: might need to change the way errors are handled
         */

        case 'Invalid access token': {
          console.log('Access token does not match id');
          throw err;
        }
        case 'The access token expired': {
          try {
            const new_token = await refreshAccessToken(this.refresh_token);
            this.access_token = new_token;
            return this.run(generatePromise);
          } catch (e: any) {
            const msg = e.response.data.error?.message || e.response.data.error;
            if (msg == 'invalid_grant') {
              console.log('Invalid refresh token');
            } else if (msg == 'invalid_client') {
              console.log('Invalid client id or client secret');
            } else {
              console.log('Unknown error');
              console.log(e);
            }
            throw e;
          }
        }
        default: {
          throw err;
        }
      }
    });
  }

  /**
   * Get recently played tracks
   * @returns List of up to 50 most recently played tracks
   */
  public async getRecentlyPlayed(): Promise<Track[]> {
    return this.run(fetchRecentlyPlayed);
  }

  /**
   * Get currently played track
   * @returns Currently played track, or a message if no track is currently played or episode is playing
   */
  public async getCurrentlyPlayed(): Promise<CurrentlyPlayingResponse> {
    return this.run(fetchCurrentlyPlayed);
  }

  /**
   * Get user profile
   * @returns profile consists of id, display name, profile images, and Spotify profile URL
   */
  public async getUserProfile(): Promise<UserProfileResponse> {
    return this.profile;
  }

  /**
   * Get album covers by spotify track ids
   * @param spotifyIdList A list of a maximum of 50 spotify tracks ids
   * @returns list of image objects of album cover-art
   */
  public async getTrackImagesById(spotifyIdList: string[]): Promise<SpotifyApi.ImageObject[][]> {
    return this.run((accessToken: string) =>
      fetchTracksBySpotifyId(accessToken, spotifyIdList).then((res) => res.tracks.map((item) => item.album.images))
    );
  }

  /**
   * Get artist images by spotify track ids (NOT spotify id for artist)
   * @param spotifyIdList A list of a maximum of 50 spotify tracks ids
   * @returns two-dimensional list of image objects of artists
   */
  public async getArtistImagesById(spotifyIdList: string[]): Promise<SpotifyApi.ImageObject[][][]> {
    return this.run((accessToken: string) =>
      fetchTracksBySpotifyId(accessToken, spotifyIdList)
        .then((res): string[][] => {
          return res.tracks.reduce<string[][]>((acc, item) => [...acc, item.artists.map((artist) => artist.id)], []);
        })
        .then((spotifyArtistIdList: string[][]) => {
          return fetchArtistImagesBySpotifyId(accessToken, spotifyArtistIdList);
        })
    );
  }

  /**
   * Get the full listening history from the db
   * @returns Look-up object with following key-value configuration: date -> spotify_url -> object with listening data specific to track
   * @example
   * const user: SpotifyUser = new SpotifyUser(...);
   * user.getListeningHistory().then((history) => {
   *    const date = new Date();
   *    const spotify_url = 'spotify:track:5wANPM4fQCJwkGd4rN57mH';
   *    const data = history[date.toDateString()][spotify_url];
   *    if (!data) console.log("didn't listen today");
   *    else console.log(data.listens);  // print today's listening data for Olivia Rodrigo's "drivers license"
   * });
   */
  public async getListeningHistory(): Promise<Record<string, DayLookup>> {
    return this.profile.then((profile) => {
      const getHistory = async (
        access_token: string
      ): Promise<AxiosResponse<{ history: Record<string, DayLookup> }>> => {
        return axios.get(
          queryParamsStringify(`${API_KEY}/user`, {
            id: profile.id,
          }),
          {
            headers: {
              Authorization: access_token,
            },
          }
        );
      };
      return this.run(getHistory).then((res) => {
        return res.data.history;
      });
    });
  }

  /**
   * Deletes user data from db, user can remove app access by going to https://www.spotify.com/us/account/apps/
   * or deny access from the /login page of the app
   */
  public deleteUser(): void {
    this.profile.then((profile) => {
      const deleteUserFromDB = async (access_token: string): Promise<void> => {
        return axios.delete(
          queryParamsStringify(`${API_KEY}/user`, {
            id: profile.id,
          }),
          {
            headers: {
              Authorization: access_token,
            },
          }
        );
      };
      this.run(deleteUserFromDB);
    });
  }
}
