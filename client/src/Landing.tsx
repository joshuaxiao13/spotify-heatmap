import Header from './components/Header';
import YearHeatmap from './components/heatmap/Year';

import spotify_logo_black from './images/spotify_logo_black.png';

const Landing = () => {
  return (
    <div className="bg-white w-screen h-screen">
      <Header />
      <div className="w-full h-3/5 flex flex-col items-center">
        <p className="h-fit my-auto text-2xl">See what you're listening to the most, anytime in the year.</p>
        <p className="w-fit mx-auto mb-2">
          Eagerly waiting for your yearly Spotify Wrapped? Spotify Heatmap allows you to view much more.
        </p>
        <ul className="max-w-md mx-auto space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
          <li>A personal heatmap detailing daily listens in the last year</li>
          <li>A ranking of your most streamed songs in the last 7 days</li>
        </ul>
        <div className="h-fit w-fit m-auto rounded-md bg-green-500 p-3 shadow-md flex">
          <a className="h-fit my-auto" href="/login">
            Login With Spotify
          </a>
          <img className="w-6 h-6 ml-2 my-auto" src={spotify_logo_black}></img>
        </div>
      </div>
      <div className="w-full flex flex-col">
        <div className="w-fit h-fit m-auto shadow-md">
          <YearHeatmap data={{}} />
        </div>
      </div>
    </div>
  );
};

export default Landing;
