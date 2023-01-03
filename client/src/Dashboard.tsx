import { useEffect, useRef, useState } from 'react';
import YearHeatmap from './heatmap/Year';
import SpotifyUser from 'spotify-api/spotifyUser';
import { useSearchParams } from 'react-router-dom';
import { UserProfileResponse } from 'spotify-api/spotifyRequests';
import { DayLookup } from 'spotify-api/models/user';
import TrackList from './components/TrackList';

const Dashboard = () => {
  const [queryParams] = useSearchParams();
  const user = useRef<SpotifyUser | null>(null);

  const [profile, setProfile] = useState<UserProfileResponse>();
  const [history, setHistory] = useState<Record<string, DayLookup>>();

  useEffect(() => {
    const access_token = queryParams.get('access_token');
    const refresh_token = queryParams.get('refresh_token');
    if (access_token && refresh_token) {
      user.current = new SpotifyUser(access_token, refresh_token);
      user.current.getRecentlyPlayed().then((res) => {
        console.log(res);
      });

      user.current.profile.then((res) => {
        setProfile(res);
      });

      user.current
        .getListeningHistory()
        .then((res) => {
          setHistory(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  return (
    <div className="w-screen h-screen bg-white">
      <header id="header" className="w-full h-20 bg-slate-800 flex" style={{ color: 'white' }}>
        <div id="logoAndName" className="h-fit w-fit my-auto mx-7 flex">
          <img
            id="profile-image"
            className="w-8 h-8"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png"
          />
          <div id="name" className="mx-7 my-auto">
            Spotify Heatmap
          </div>
        </div>
      </header>

      <div id="dashboard" className="w-full flex">
        <div id="dashboardLeft" className="w-1/5">
          <img
            className="rounded-full w-3/5 mx-auto mt-10 mb-4 shadow-md border-3"
            src={profile?.images && profile.images[0]?.url}
          ></img>
          <div className="w-full">
            <div className="mx-auto w-fit text-center text-lg">{profile?.display_name}</div>
          </div>
        </div>
        <div id="dashboardRight" className="w-4/5">
          <div id="heatmap" className="w-fit mx-auto my-10">
            <YearHeatmap />
          </div>
          <div
            id="recentActivity"
            className="w-fit mx-auto bg-gray-50 my-10 rounded-xl text-center p-2 shadow-md border-2 hover:scale-105"
          >
            Recent Activity
          </div>
          <TrackList history={history} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
