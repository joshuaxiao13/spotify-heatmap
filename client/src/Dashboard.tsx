import {
  CurrentlyPlayingResponse,
  UserProfileResponse,
  CreateSpotifyPlaylistResponse,
} from 'spotify-api/spotifyRequests';

import { DayLookup } from 'spotify-api/models/user';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CurrentlyPlaying from './components/CurrentlyPlaying';
import SpotifyUser from 'spotify-api/spotifyUser';
import TrackList from './components/TrackList';
import YearHeatmap from './components/heatmap/Year';
import Header from './components/Header';
import Modal from './components/Modal';

const Dashboard = () => {
  const [queryParams] = useSearchParams();
  const user = useRef<SpotifyUser | null>(null);
  const filterHistoryPromise = useRef<Promise<Record<string, DayLookup>> | null>(null);

  const [profile, setProfile] = useState<UserProfileResponse>();
  const [history, setHistory] = useState<Record<string, DayLookup>>();
  const [historyForTable, setHistoryForTable] = useState<{ history: Record<string, DayLookup>; day: string }>();
  const [currentSong, setCurrentSong] = useState<CurrentlyPlayingResponse>();
  const [isDeleteUserDataModalShow, setIsDeleteUserModalShow] = useState(false);

  // Youtube to Spotify playlist conversion states
  const [youtubePlaylistURL, setYoutubePlaylistURL] = useState('');
  const [isYoutubePlaylistConverterModalShow, setIsYoutubePlaylistConverterModalShow] = useState(false);
  const [spotifyPlaylistID, setSpotifyPlaylistID] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const handleNonCellClick = (el: HTMLElement) => {
    if (el && !el.classList?.contains('day-cell')) {
      if (filterHistoryPromise.current) {
        filterHistoryPromise.current.then((res) => {
          setHistoryForTable({ history: res, day: 'This Week' });
        });
      }
    }
  };

  useEffect(() => {
    const access_token = queryParams.get('access_token');
    const refresh_token = queryParams.get('refresh_token');
    if (access_token && refresh_token) {
      user.current = new SpotifyUser(access_token, refresh_token);

      setTimeout(() => {
        if (!user.current) return;
        user.current?.profile.then((res) => {
          setProfile(res);
        });

        filterHistoryPromise.current = user.current.getListeningHistory().then((res) => {
          setHistory(res);
          const filterThisWeekOnly: Record<string, DayLookup> = {};
          const date = new Date();
          do {
            const lookup: DayLookup = res[date.toDateString()];
            if (lookup) {
              filterThisWeekOnly[date.toDateString()] = lookup;
            }
            date.setDate(date.getDate() - 1);
          } while (date.getDay() !== 6);
          return filterThisWeekOnly;
        });

        filterHistoryPromise.current
          .then((res) => {
            setHistoryForTable({ history: res, day: 'This Week' });
          })
          .catch((err) => {
            console.log(err);
          });

        const updateCurrentSong = async (): Promise<void> => {
          user
            .current!.getCurrentlyPlayed()
            .then((res) => {
              setCurrentSong(res);
            })
            .catch((err) => {
              console.log(err);
            });
        };

        updateCurrentSong();
        setInterval(updateCurrentSong, 60000);
      }, 500);
    }
  }, []);

  const navigate = useNavigate();

  return (
    <>
      <Modal
        // delete user data modal
        show={isDeleteUserDataModalShow}
        onClose={() => setIsDeleteUserModalShow(false)}
        title={`Delete User Data`}
        content={
          <>
            Will remove data stored on our database for your account. This data allows Spotify Heatmap to view your play
            history since registration with this site (and render those green squares below). You can remove app access
            by going to{' '}
            <a
              href="https://www.spotify.com/us/account/apps/"
              className="underline text-blue-600"
              target="_blank"
              rel="noreferrer"
            >
              https://www.spotify.com/us/account/apps/
            </a>{' '}
            or deny access from the spotify app authorization redirection when you login.
          </>
        }
        buttonText={'Confirm'}
        onClickHandler={() => {
          if (user.current) {
            user.current.deleteUser();
            navigate('/');
          }
        }}
      />
      <Modal
        // youtube to playlist converter modal
        show={isYoutubePlaylistConverterModalShow}
        onClose={() => {
          setYoutubePlaylistURL('');
          setSpotifyPlaylistID('');
          setIsYoutubePlaylistConverterModalShow(false);
          setIsConverting(false);
        }}
        title={`Youtube Playlist to Spotify Playlist Converter`}
        content={
          <>
            <div>
              Will create a public playlist in your spotify account from the tracks given in the youtube playlist. The
              input should be a URL to the youtube playlist. Our team has observed issues with converting youtube
              playlists that are also 'mixtapes'; it is recommended that only playlists that are not mixtapes are used
              given to the converter. Note that our team has imposed a limit of roughly 500 songs that can be added to a
              playlist in a single conversion. If the given youtube playlist has over 500 songs, we will only add the
              first roughly 500 songs.
            </div>
            <br />
            <h4 id="youtube-url-title" className="mb-5 font-bold mx-auto text-center">
              Youtube Playlist URL
            </h4>
            <div className="w-11/12 mx-auto flex items-center justify-center">
              {/* area where user inputs youtube playlist url */}
              <input
                type="text"
                className="resize-none w-11/12 h-5/6 my-auto mx-auto bg-gray-200 py-6
              px-3 border-blue-10 rounded-xl"
                placeholder="ex. https://www.youtube.com/watch?v=eVNNfmr_vWI&list=PLyNlWGsQdus6v2P38x0urM9CeKX0lAQsM"
                value={youtubePlaylistURL}
                onChange={(e) => setYoutubePlaylistURL(e.target.value)}
              />
            </div>
            <h4 id="spotify-playlist-title" className="my-5 font-bold mx-auto text-center">
              {spotifyPlaylistID && 'Spotify Playlist'}
            </h4>
            <div className="w-11/12 mx-auto flex items-center justify-center">
              {(isConverting && (
                // if in the process of converting, show loading animation
                <div
                  className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
              )) || (
                // if not in the process of converting, show the embed spotify playlist (if the user has converted a playlist already)
                <div className="flex items-center justify-center" placeholder="type message here">
                  {/* area where spotify playlist embded is shown */}
                  {spotifyPlaylistID && (
                    <iframe
                      src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistID}`}
                      width="450"
                      height="400"
                      allow="encrypted-media"
                      title="Spotify Playlist"
                    ></iframe>
                  )}
                </div>
              )}
            </div>
            <br />
          </>
        }
        buttonText={'Create Spotify Playlist'}
        onClickHandler={async () => {
          try {
            setIsConverting(true);
            const spotifyTracks = await user.current?.getSpotifyTracksByYoutubePlaylistURL(youtubePlaylistURL);

            if (spotifyTracks === undefined) {
              throw new Error('User Profile has not loaded yet, please retry when loading has finished');
            }

            const newSpotifyPlaylistInfo: CreateSpotifyPlaylistResponse | undefined =
              await user.current?.createSpotifyPlaylistFromSpotifyURIs(spotifyTracks);

            if (newSpotifyPlaylistInfo === undefined) {
              throw new Error('User Profile has not loaded yet, please retry when loading has finished');
            }

            setSpotifyPlaylistID(newSpotifyPlaylistInfo.spotifyPlaylistID);
          } catch (error) {
            alert('Error converting playlist. Ensure that the URL is a valid Youtube playlist.');
          } finally {
            setIsConverting(false);
          }
        }}
      />
      <div className="w-screen h-screen min-h-fit bg-white dark:bg-black">
        <Header
          showDeleteUserModal={() => setIsDeleteUserModalShow(true)}
          showYoutubePlaylistConverterModal={() => setIsYoutubePlaylistConverterModalShow(true)}
        />

        <div id="dashboard" className="w-full flex">
          <div id="dashboardLeft" className="w-1/5">
            <img
              className="rounded-full w-3/5 mx-auto mt-10 mb-4 shadow-md border-3"
              src={profile?.images && (profile.images[1]?.url ?? profile.images[0]?.url)}
            ></img>
            <div className="w-full">
              <div className="mx-auto w-fit text-center text-lg dark:text-white">{profile?.display_name}</div>
            </div>

            <div className="w-full">
              <CurrentlyPlaying data={currentSong} />
            </div>
          </div>
          <div id="dashboardRight" className="w-4/5">
            <div className="w-fit mx-auto my-10">
              <YearHeatmap
                data={history || {}}
                dayOnClick={(newHistory: { history: Record<string, DayLookup>; day: string }) =>
                  setHistoryForTable(newHistory)
                }
                handleNonCellClick={handleNonCellClick}
              />
              <p className="text-xs text-gray-400">
                *heatmap only displays data logged since registration with spotify heatmap.
              </p>
            </div>
            <TrackList
              data={historyForTable}
              fetchTrackImagesById={user.current?.getTrackImagesById.bind(user.current)}
              fetchArtistImagesById={user.current?.getArtistImagesById.bind(user.current)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
