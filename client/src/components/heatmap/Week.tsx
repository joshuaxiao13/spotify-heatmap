import DayHeatmap, { Day } from './Day';

export type Week = Day[];

interface WeekHeatmapProps {
  data: Week;
  stats: { mean: number; std: number };
}

const WeekHeatmap = (props: WeekHeatmapProps) => {
  const { data, stats } = props;
  return (
    <div className="w-fit h-fit">
      {data.map((day) => {
        return <DayHeatmap data={day} stats={stats} />;
      })}
    </div>
  );
};

export default WeekHeatmap;
