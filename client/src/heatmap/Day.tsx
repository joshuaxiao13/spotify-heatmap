interface Song {
  title: string;
  artist: string;
  uri: string;
  plays: number;
}

export interface Day {
  date: string;
  numberOfSongsPlayed: number;
  songsPlayed: Song[];
}

const DayHeatmap = (props: { data: Day }) => {
  const { numberOfSongsPlayed } = props.data;
  // scaledColor must be in the set [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  const scaledColor = Math.max(Math.floor(Math.min(0.9, numberOfSongsPlayed / 50) * 10) * 100, 50);

  // do not concat. the scaledColor to the end of the string. This can cause issues:
  // https://tailwindcss.com/docs/content-configuration#class-detection-in-depth:~:text=exist%20in%20full%3A-,Always%20use%20complete%20class%20names,-%3Cdiv%20class
  let cellColor: string;
  switch (scaledColor) {
    case 50:
      cellColor = numberOfSongsPlayed !== 0 ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-300';
      break;
    case 100:
      cellColor = 'bg-green-100 border-green-300';
      break;
    case 200:
      cellColor = 'bg-green-200 border-green-400';
      break;
    case 300:
      cellColor = 'bg-green-300 border-green-500';
      break;
    case 400:
      cellColor = 'bg-green-400 border-green-600';
      break;
    case 500:
      cellColor = 'bg-green-500 border-green-700';
      break;
    case 600:
      cellColor = 'bg-green-600 border-green-800';
      break;
    case 700:
      cellColor = 'bg-green-700 border-green-900';
      break;
    case 800:
      cellColor = 'bg-green-800 border-gray-900';
      break;
    case 900:
      cellColor = 'bg-green-900 border-black';
      break;
    default:
      cellColor = 'bg-white';
  }

  return <div className={`w-4 h-4 m-1 rounded-sm border-[1px] ${cellColor}`}></div>;
};

export default DayHeatmap;
