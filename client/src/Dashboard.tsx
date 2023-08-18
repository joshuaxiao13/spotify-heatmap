import { CurrentlyPlayingResponse, UserProfileResponse } from 'spotify-api/spotifyRequests';
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
  const [isModalShow, setIsModalShow] = useState(false);

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
        show={isModalShow}
        onClose={() => setIsModalShow(false)}
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
      <div className="w-screen h-screen min-h-fit bg-white dark:bg-black">
        <Header
          deleteUserHandler={user.current?.deleteUser.bind(user.current)}
          showModal={() => setIsModalShow(true)}
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
