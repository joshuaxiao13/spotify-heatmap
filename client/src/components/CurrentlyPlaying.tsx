import { CurrentlyPlayingResponse } from 'spotify-api/spotifyRequests';
import { DoubleClef } from '../icons/DoubleClef';
import Marquee from 'react-fast-marquee';

interface CurrentlyPlayingProps {
  data?: CurrentlyPlayingResponse;
}

const CurrentlyPlaying = ({ data }: CurrentlyPlayingProps) => {
  const { albumImages, artists, name } = data || {};

  if (!name) return <></>;

  return (
    <div className="w-2/3 mx-auto my-6 flex rounded-md shadow-md border-[1px] p-1 dark:bg-gray-900 dark:border-gray-700">
      <div className="w-1/4 m-auto">
        <img
          src={albumImages && albumImages[0].url}
          className="rounded-md w-11/12 m-auto dark:border-gray-700 dark:border-[1px]"
        ></img>
      </div>
      <div className="my-auto w-3/4 h-fit dark:text-gray-200">
        <span className="flex">
          <p className="mx-1 text-sm text-gray-500 truncate ... dark:text-gray-400">Currently Listening</p>
          <DoubleClef />
        </span>
        <Marquee className="text-md" gradient={false}>
          {name}
        </Marquee>
        <Marquee className="text-xs" gradient={false}>
          {artists?.join(', ')}
        </Marquee>
      </div>
    </div>
  );
};

export default CurrentlyPlaying;
