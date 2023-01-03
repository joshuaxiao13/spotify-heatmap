import { DayLookup } from 'spotify-api/models/user';
import { useState } from 'react';

export interface Day {
  date: string;
  numberOfSongsPlayed: number;
  minsPlayed: number;
  songsPlayed: DayLookup;
}

interface DayHeatmapProps {
  data: Day;
  stats: {
    mean: number;
    std: number;
  };
}

const DayHeatmap = (props: DayHeatmapProps) => {
  const [isHover, setIsHover] = useState(false);

  const { data, stats } = props;
  const { mean, std } = stats;
  const { date, numberOfSongsPlayed, minsPlayed } = data;

  const zScore = std === 0 ? 0 : (numberOfSongsPlayed - mean) / std;
  // do not concat. the scaledColor to the end of the string. This can cause issues:
  // https://tailwindcss.com/docs/content-configuration#class-detection-in-depth:~:text=exist%20in%20full%3A-,Always%20use%20complete%20class%20names,-%3Cdiv%20class
  let cellColor: string;
  if (numberOfSongsPlayed === 0) {
    cellColor = 'bg-gray-100 border-gray-300';
  } else if (zScore <= -3) {
    cellColor = 'bg-green-50 border-green-200';
  } else if (zScore <= -2) {
    cellColor = 'bg-green-100 border-green-300';
  } else if (zScore <= -1) {
    cellColor = 'bg-green-200 border-green-500';
  } else if (zScore <= 0) {
    cellColor = 'bg-green-400 border-green-600';
  } else if (zScore <= 1) {
    cellColor = 'bg-green-500 border-green-700';
  } else if (zScore <= 2) {
    cellColor = 'bg-green-700 border-green-900';
  } else {
    cellColor = 'bg-green-900 border-black';
  }

  return (
    <div
      className={`w-4 h-4 m-1 rounded-sm border-[1px] ${cellColor} ${isHover && 'border-black'}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {isHover && (
        <div className="bg-black text-white p-2 fixed ml-5 rounded-sm first-letter text-xs">{`${numberOfSongsPlayed} streams on ${date}`}</div>
      )}
    </div>
  );
};

export default DayHeatmap;
