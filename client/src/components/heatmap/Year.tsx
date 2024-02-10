import { useEffect } from 'react';
import WeekHeatmap, { Week } from './Week';
import { DayLookup } from 'spotify-api/models/user';

const getPreviousDay = (date: Date) => {
  const previous = new Date(date.getTime());
  previous.setDate(date.getDate() - 1);

  return previous;
};

/**
 * Groups the the yearly listening data by week
 * @param data yearly listening data of the user
 * @returns an array where each element contains weekly listening data (most recent week appears last in array)
 */
const groupbyWeek = (data: Record<string, DayLookup>) => {
  let currentDate = new Date();
  const listensGroupedByWeek: Week[] = [];
  let currentWeekListens: Week = [];

  // lookup user's play history for the previous year
  // 371 = 365 + 6. There are cases where the earliest week displayed
  // doesn't have all its days filled if we only display 365 days.
  // There can be at most 7 - 1 = 6 days not filled
  // Note: we don't neccesarily display all 371 days (the condition to push the current week below)
  for (let i = 0; i < 371; ++i) {
    const lookupByUrl = data[currentDate.toDateString()] || {};
    currentWeekListens[currentDate.getDay()] = {
      date: currentDate.toDateString(),
      numberOfSongsPlayed: Object.keys(lookupByUrl).reduce((previous, key) => previous + lookupByUrl[key].listens, 0),
      minsPlayed: Math.floor(
        Object.keys(lookupByUrl).reduce(
          (previous, key) => previous + lookupByUrl[key].duration_ms * lookupByUrl[key].listens,
          0
        ) /
          (1000 * 60)
      ),
      songsPlayed: lookupByUrl,
    };

    // Push the current week
    if (currentDate.getDay() === 0) {
      if (i === 364) {
        for (let j = currentDate.getDay() - 1; j >= 0; --j) {
          currentDate = getPreviousDay(currentDate);
          currentWeekListens[currentDate.getDay()] = {
            date: currentDate.toDateString(),
            numberOfSongsPlayed: 0,
            minsPlayed: 0,
            songsPlayed: {},
          };
        }
      }
      listensGroupedByWeek.push(currentWeekListens);

      currentWeekListens = [];
    }

    currentDate = getPreviousDay(currentDate);
  }

  // weeks were pushed so that recent appears first, reverse to get older weeks first
  listensGroupedByWeek.reverse();
  return listensGroupedByWeek;
};

/**
 * Computes the mean and standard deviation of the number of listens in a day (only accounting for days with >= 1 listens)
 * @param data yearly listening data of the user
 * @returns the mean and std
 */
const getStatistics = (data: Record<string, DayLookup>): { mean: number; std: number } => {
  let currentDate = new Date();
  let listensGroupedByDay = [];

  // lookup the user's play history for the previous year
  for (let i = 0; i < 365; ++i) {
    const lookupByUrl = data[currentDate.toDateString()] || {};
    const numberOfSongsPlayedInDay = Object.keys(lookupByUrl).reduce(
      (previous, key) => previous + lookupByUrl[key].listens,
      0
    );
    listensGroupedByDay.push(numberOfSongsPlayedInDay);

    currentDate = getPreviousDay(currentDate);
  }

  listensGroupedByDay = listensGroupedByDay.filter((val) => val > 0);

  if (listensGroupedByDay.length === 0) {
    return { mean: 0, std: 0 };
  }

  const mean = listensGroupedByDay.reduce((previous, val) => previous + val, 0) / listensGroupedByDay.length;
  const stdSquared =
    listensGroupedByDay.reduce((previous, val) => previous + Math.pow(val - mean, 2)) / listensGroupedByDay.length;
  const std = Math.sqrt(stdSquared);

  return { mean, std };
};

interface YearHeatmapProps {
  data: Record<string, DayLookup>;
  dayOnClick?: (history: { history: Record<string, DayLookup>; day: string }) => void;
  handleNonCellClick?: (el: HTMLElement) => void;
}

const YearHeatmap = ({ data, dayOnClick, handleNonCellClick }: YearHeatmapProps) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target: HTMLElement = event.target as HTMLElement;
      const cells = document.querySelectorAll('.day-cell');
      cells.forEach((cell) => {
        const cellDiv = cell as HTMLDivElement;
        if (target === cellDiv) {
          cellDiv.style.borderColor = 'rgb(0,191,255)';
          cellDiv.classList.add('animate-pulse');
        } else {
          cellDiv.style.borderColor = '';
          cellDiv.classList.remove('animate-pulse');
        }
      });

      if (!target.classList.contains('day-cell') && handleNonCellClick) {
        handleNonCellClick(target);
      }
    };

    document.getElementById('heatmap')?.addEventListener('click', handleClick);

    return () => {
      document.getElementById('heatmap')?.removeEventListener('click', handleClick);
    };
  }, []);

  const year = groupbyWeek(data);
  const stats = getStatistics(data);

  return (
    <div
      id="heatmap"
      className="bg-white dark:bg-gray-900 dark:border-gray-700 flex w-fit h-fit p-3 rounded-sm border-[1px] cursor-pointer"
    >
      {year.map((week) => (
        <WeekHeatmap key={week[0]?.date} data={week} stats={stats} dayOnClick={dayOnClick} />
      ))}
    </div>
  );
};

export default YearHeatmap;
