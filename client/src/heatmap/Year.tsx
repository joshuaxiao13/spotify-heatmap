import WeekHeatmap, { Week } from './Week';
import { Day } from './Day';

//functions for testing, remove eventually
//--------------------------------------------------------------
const genDailyData = (): Day => {
  const day: Day = {
    date: '2022-12-24',
    numberOfSongsPlayed: Math.random() * 50,
    songsPlayed: [
      {
        title: 'All Too Well',
        artist: 'Taylor Swift',
        uri: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/5enxwA8aAbwZbf5qCHORXi?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
        plays: Math.random() * 50,
      },
    ],
  };
  return day;
};

export const genWeeklyData = (): Week => {
  const week: Week = [
    genDailyData(),
    genDailyData(),
    genDailyData(),
    genDailyData(),
    genDailyData(),
    genDailyData(),
    genDailyData(),
  ];
  return week;
};

const genYearlyData = (): Week[] => {
  const year: Week[] = [];
  for (let i = 0; i < 52; ++i) {
    year.push(genWeeklyData());
  }

  return year;
};
//--------------------------------------------------------------

const YearHeatmap = () => {
  const year = genYearlyData();

  return (
    <div className="scale-90 bg-white flex w-fit h-fit p-3 rounded-sm shadow-sm border-2">
      {year.map((week) => {
        return <WeekHeatmap data={week}></WeekHeatmap>;
      })}
    </div>
  );
};

export default YearHeatmap;
