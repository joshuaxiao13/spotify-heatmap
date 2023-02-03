import { DayLookup } from 'spotify-api/models/user';
import { useState } from 'react';
import HoverPopup from '../HoverPopup';

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

  dayOnClick?: (data: { history: Record<string, DayLookup>; day: string }) => void;
}

const DayHeatmap = ({ data, stats, dayOnClick }: DayHeatmapProps) => {
  const [isHover, setIsHover] = useState(false);
  const { mean, std } = stats;
  const { date, numberOfSongsPlayed, minsPlayed } = data;

  const zScore = std === 0 ? 0 : (numberOfSongsPlayed - mean) / std;
  // do not concat. the scaledColor to the end of the string. This can cause issues:
  // https://tailwindcss.com/docs/content-configuration#class-detection-in-depth:~:text=exist%20in%20full%3A-,Always%20use%20complete%20class%20names,-%3Cdiv%20class
  let cellColor: string;
  if (numberOfSongsPlayed === 0) {
    cellColor = 'bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-700';
  } else if (zScore <= -1.5) {
    cellColor = 'bg-green-50 border-green-200';
  } else if (zScore <= -1) {
    cellColor = 'bg-green-100 border-green-300';
  } else if (zScore <= -0.5) {
    cellColor = 'bg-green-200 border-green-500';
  } else if (zScore <= 0) {
    cellColor = 'bg-green-400 border-green-600';
  } else if (zScore <= 0.5) {
    cellColor = 'bg-green-500 border-green-700';
  } else if (zScore <= 1) {
    cellColor = 'bg-green-700 border-green-900';
  } else {
    cellColor = 'bg-green-800 border-black';
  }

  const formatMinutes = (mins: number): string => {
    const hours = Math.floor(mins / 60);
    const minutes = Math.floor(mins % 60);
    let ret: string = '';
    if (hours > 0) ret += hours + ' hr';
    if (minutes > 0) {
      if (ret.length > 0) ret += ' ';
      ret += minutes + ' min';
    }
    return ret;
  };

  return (
    <div
      className={`day-cell w-3.5 h-3.5 m-0.5 rounded-sm border-[1px] ${cellColor} hover:border-black`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => {
        if (dayOnClick) {
          dayOnClick({ history: { [date]: data.songsPlayed }, day: date });
        }
      }}
    >
      {isHover && (
        <HoverPopup
          textList={
            [
              `${numberOfSongsPlayed} streams on ${date}`,
              minsPlayed > 0 && `Listened ${formatMinutes(minsPlayed)}`,
            ].filter((text) => text) as string[]
          }
        />
      )}
    </div>
  );
};

export default DayHeatmap;
