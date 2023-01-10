import { DayLookup } from 'spotify-api/models/user';
import DayHeatmap, { Day } from './Day';

export type Week = Day[];

interface WeekHeatmapProps {
  data: Week;
  stats: { mean: number; std: number };
  dayOnClick?: (data: { history: Record<string, DayLookup>; day: string }) => void;
}

const WeekHeatmap = ({ data, stats, dayOnClick }: WeekHeatmapProps) => {
  return (
    <div className="w-fit h-fit">
      {data.map((day) => {
        return <DayHeatmap key={day.date} data={day} stats={stats} dayOnClick={dayOnClick} />;
      })}
    </div>
  );
};

export default WeekHeatmap;
