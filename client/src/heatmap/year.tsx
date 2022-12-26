import WeekHeatmap, { Week } from "./week";
import { Day } from "./day";

const YearHeatmap = () => {

    //functions for testing, remove eventually
    //--------------------------------------------------------------
    const genDailyData = (): Day => {
        const day: Day = {
            date: '2022-12-24',
            numberOfSongsPlayed: Math.random() * 50,
            songsPlayed: [],
        };
        return day;
    }

    const genWeeklyData = (): Week => {
        const week: Week = [genDailyData(), genDailyData(), genDailyData(), genDailyData(), genDailyData(), genDailyData(), genDailyData()]
        return week;
    };

    const year: Week[] = [];
    for (let i = 0; i < 52; ++i) {
        year.push(genWeeklyData());
    }
    //--------------------------------------------------------------

    return (
        <div className="scale-75 flex border w-fit p-3 rounded-sm mx-auto shadow-sm">
            {year.map((week) => {
                return <WeekHeatmap data={week}></WeekHeatmap>;
            })}
        </div>
    );
}

export default YearHeatmap;
