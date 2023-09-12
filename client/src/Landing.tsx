import Header from './components/Header';
import YearHeatmap from './components/heatmap/Year';

import spotify_logo_black from './assets/Spotify_Icon_RGB_Black.png';
import genExampleData from './LandingHeatmap';

const Landing = () => {
  const data = genExampleData();
  return (
    <div className="bg-white w-screen h-screen dark:bg-black">
      <Header />
      <div className="w-full h-3/5 flex flex-col items-center">
        <p className="h-fit my-auto text-2xl dark:text-gray-300">
          See what you're listening to the most 🎧, anytime of the year 📅
        </p>
        <p className="w-fit mx-auto mb-2 dark:text-gray-400">
          Eagerly waiting for your yearly Spotify Wrapped? Spotify Heatmap allows you to view much more 📈
        </p>
        <ul className="w-fit mx-auto space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
          <li>A personal heatmap detailing daily listens in the last year</li>
          <li>A ranking of your most streamed songs in the past week and any day</li>
          <li>YouTube to Spotify playlist converter</li>
        </ul>
        <div className="h-fit w-fit m-auto rounded-md bg-green-500 p-3 shadow-md">
          <a className="h-fit my-auto flex gap-x-0" href="/login">
            <span>Login With Spotify</span>
            <img className="w-6 h-6 ml-2 my-auto" src={spotify_logo_black}></img>
          </a>
        </div>
      </div>
      <div className="w-full flex flex-col">
        <div className="w-fit h-fit m-auto shadow-md">
          <YearHeatmap data={data} />
        </div>
      </div>
    </div>
  );
};

export default Landing;
