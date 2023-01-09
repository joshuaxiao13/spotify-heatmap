import { CurrentlyPlayingResponse, UserProfileResponse } from 'spotify-api/spotifyRequests';
import { DayLookup } from 'spotify-api/models/user';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CurrentlyPlaying from './components/CurrentlyPlaying';
import SpotifyUser from 'spotify-api/spotifyUser';
import TrackList from './components/TrackList';
import YearHeatmap from './components/heatmap/Year';
import Header from './components/Header';
import Modal from './components/Modal';

const Dashboard = () => {
  const [queryParams] = useSearchParams();
  const user = useRef<SpotifyUser | null>(null);

  const [profile, setProfile] = useState<UserProfileResponse>();
  const [history, setHistory] = useState<Record<string, DayLookup>>();
  const [historyForTable, setHistoryForTable] = useState<Record<string, DayLookup>>();
  const [currentSong, setCurrentSong] = useState<CurrentlyPlayingResponse>();
  const [isModalShow, setIsModalShow] = useState(false); //modal

  useEffect(() => {
    const access_token = queryParams.get('access_token');
    const refresh_token = queryParams.get('refresh_token');
    if (access_token && refresh_token) {
      user.current = new SpotifyUser(access_token, refresh_token);

      user.current.profile.then((res) => {
        setProfile(res);
      });

      user.current
        .getListeningHistory()
        .then((res) => {
          setHistory(res);
          setHistoryForTable(res);
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

      document.addEventListener('click', (event: MouseEvent) => {
        console.log(event.target);
      });

      updateCurrentSong();
      setInterval(updateCurrentSong, 60000);
    }
  }, []);

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
            user.current?.deleteUser.bind(user.current);
            window.location.reload();
          }
        }}
      />
      <div className="w-screen h-screen bg-white">
        <Header
          deleteUserHandler={user.current?.deleteUser.bind(user.current)}
          showModal={() => setIsModalShow(true)}
        />

        <div id="dashboard" className="w-full flex">
          <div id="dashboardLeft" className="w-1/5">
            <img
              className="rounded-full w-3/5 mx-auto mt-10 mb-4 shadow-md border-3"
              src={profile?.images && profile.images[0]?.url}
            ></img>
            <div className="w-full">
              <div className="mx-auto w-fit text-center text-lg">{profile?.display_name}</div>
            </div>

            <div className="w-full">
              <CurrentlyPlaying data={currentSong} />
            </div>
          </div>
          <div id="dashboardRight" className="w-4/5">
            <div id="heatmap" className="w-fit mx-auto my-10">
              <YearHeatmap data={history || {}} dayOnClick={(newHistory) => setHistoryForTable(newHistory)} />
              <p className="text-xs text-gray-400">
                *heatmap only displays data logged since registration with spotify heatmap.
              </p>
            </div>
            <TrackList
              history={historyForTable}
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
