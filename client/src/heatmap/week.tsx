import DayHeatmap, { Day } from "./Day";

export type Week = [Day, Day, Day, Day, Day, Day, Day];

const WeekHeatmap = (props: {data: Week}) => {
    const { data } = props;
    return (
        <div className="w-fit h-fit">
            {data.map((day) => {
                return <DayHeatmap data={day}/>;
            })}
        </div>
    );
};

export default WeekHeatmap;
