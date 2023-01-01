import { useEffect, useRef, useState } from 'react';
import YearHeatmap, { genWeeklyData } from './heatmap/Year';
import SpotifyUser from 'spotify-api';
import { useSearchParams } from 'react-router-dom';

const Dashboard = () => {
  const [queryParams] = useSearchParams();
  const user = useRef<SpotifyUser | null>(null);

  const [profile, setProfile] = useState<any>({});

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
    }
  }, []);

  return (
    <div className="w-screen h-screen">
      <header id="header" className="w-full h-20 bg-slate-800 flex" style={{ color: 'white' }}>
        <div id="logoAndName" className="h-fit w-fit my-auto mx-7 flex">
          <img
            id="logo"
            className="w-8 h-8"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png"
          />
          <div id="name" className="mx-7 my-auto">
            Spotify Heatmap
          </div>
        </div>
      </header>

      <div id="dashboard" className="w-full flex">
        <div id="dashboardLeft" className="w-1/4">
          <img
            className="rounded-full w-2/3 mx-auto mt-10 mb-4 shadow-md border-3"
            src={profile.images && profile.images[0].url}
          ></img>
          <div className="w-full">
            <div className="mx-auto w-fit text-center text-3xl">{profile.display_name}</div>
          </div>
        </div>
        <div id="dashboardRight" className="w-3/4">
          <div id="heatmap" className="w-fit mx-auto my-10">
            <YearHeatmap />
          </div>
          <div
            id="recentActivity"
            className="w-fit mx-auto bg-gray-50 my-10 rounded-xl text-center p-2 shadow-md border-2 hover:scale-105"
          >
            Recent Activity
          </div>
          <div>
            {genWeeklyData().map(({ date, songsPlayed }) => {
              return (
                <div className="my-5 h-fit border-l-4">
                  <div className="flex">
                    <div
                      className=" bg-slate-400 w-10 h-10 bg-red rounded-full flex 
 justify-center item-center mx-3 shadow-md"
                    >
                      <p className="m-auto text-gray-600">{songsPlayed.length}</p>
                    </div>
                    <div className="text-lg my-auto">{date}</div>
                  </div>
                  {songsPlayed.map(({ title, artist, uri, plays }) => (
                    <div className="w-1/2 border-2 shadow-sm mx-auto p-3 rounded-md">
                      <div className="mb-1">
                        <div className="text-lg">{title}</div>
                        <div className="text-sm">{artist}</div>
                      </div>
                      <iframe
                        className="border-radius:12px"
                        src="https://open.spotify.com/embed/track/5enxwA8aAbwZbf5qCHORXi?utm_source=generator"
                        width="100%"
                        height="152"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      ></iframe>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
