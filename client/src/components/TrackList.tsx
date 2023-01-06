import { DayLookup, TrackData } from 'spotify-api/models/user';

function mostListensThisWeek(history: Record<string, DayLookup>): [string, TrackData][] {
  const currentDate = new Date();
  const trackToListens = new Map<string, number>();
  const trackToInfo = new Map<string, TrackData>();
  do {
    console.log(currentDate.toDateString());
    const lookup: DayLookup = history[currentDate.toDateString()];
    if (lookup) {
      Object.entries(lookup).forEach(([trackUri, trackData]) => {
        const accumulatedListens: number = trackToListens.get(trackUri) || 0;
        if (accumulatedListens === 0) {
          trackToInfo.set(trackUri, trackData);
        }
        trackToListens.set(trackUri, trackData.listens + accumulatedListens);
      });
    }
    currentDate.setDate(currentDate.getDate() - 1);
  } while (currentDate.getDay() !== 6);

  const trackToListensList: [string, number][] = Array.from(trackToListens).sort((a, b) => b[1] - a[1]);
  const ret: [string, TrackData][] = trackToListensList.slice(0, 10).map(([trackUri, listens]) => {
    const data = trackToInfo.get(trackUri)!;
    return [trackUri, { ...data, listens: listens }];
  });
  return ret;
}

interface TrackListProps {
  history: Record<string, DayLookup> | undefined;
}

const TrackList = ({ history }: TrackListProps) => {
  if (!history) return <></>;
  return (
    <div className="w-2/3 pt-5 my-2 bg-gray-100 rounded-md border border-gray-300 mx-auto relative overflow-x-auto">
      <table className="border-collapse table-auto w-full">
        <thead>
          <tr className="border-b text-left text-sm font-medium text-gray-500">
            <th className="px-5 py-2">#</th>
            <th className="px-5 py-2">Track Title</th>
            <th className="px-5 py-2">Artist</th>
            <th className="px-5 py-2">Listens</th>
          </tr>
        </thead>
        <tbody className="bg-white text-gray-600 shadow-md text-sm">
          {history &&
            mostListensThisWeek(history).map(([trackUri, trackData], id) => {
              return (
                <tr className="border-b border-[1px]">
                  <td className="px-5 py-2">{id + 1}</td>
                  <td className="px-5 py-2">
                    <a href={trackUri}>{trackData.name}</a>
                  </td>
                  <td className="px-5 py-2">{trackData.artists.join(', ')}</td>
                  <td className="px-5 py-2">{trackData.listens}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default TrackList;
