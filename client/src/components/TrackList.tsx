import { useEffect, useState } from 'react';
import { DayLookup, TrackData } from 'spotify-api/models/user';

type fetchTrackImagesFun = (spotifyIdList: string[]) => Promise<SpotifyApi.ImageObject[][]>;

async function mostListensThisWeek(
  history: Record<string, DayLookup>,
  fetchTrackImagesById: fetchTrackImagesFun
): Promise<[{ uri: string; images: SpotifyApi.ImageObject[] }, TrackData][]> {
  const currentDate = new Date();
  const trackToListens = new Map<string, number>();
  const trackToInfo = new Map<string, TrackData>();
  do {
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
  const topTracks: [string, TrackData][] = trackToListensList
    .reduce<[string, TrackData][]>((acc, [trackUri, listens]) => {
      const data = trackToInfo.get(trackUri)!;
      if (!data.spotify_id) return acc;
      return [...acc, [trackUri, { ...data, listens: listens }]];
    }, [])
    .slice(0, 10);
  const imageObjects: SpotifyApi.ImageObject[][] = await fetchTrackImagesById(
    topTracks.map(([_, data]) => data.spotify_id)
  );
  return topTracks.map(([uri, data], idx) => [{ uri: uri, images: imageObjects[idx] }, data]);
}

interface TrackListProps {
  history: Record<string, DayLookup> | undefined;
  fetchTrackImagesById: fetchTrackImagesFun | undefined;
}

const TrackList = ({ history, fetchTrackImagesById }: TrackListProps) => {
  const [trackList, setTrackList] = useState<[{ uri: string; images: SpotifyApi.ImageObject[] }, TrackData][]>();

  useEffect(() => {
    if (history && fetchTrackImagesById) {
      mostListensThisWeek(history, fetchTrackImagesById)
        .then((res) => setTrackList(res))
        .catch((e) => {
          console.log(e);
        });
    }
  }, [history, fetchTrackImagesById]);

  if (!(history && fetchTrackImagesById) || !trackList) return <></>;

  return (
    <>
      <h2 id="recentActivity" className="text-center">
        Recent Activity This Week
      </h2>
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
              trackList.map(([{ uri, images }, trackData], idx) => {
                return (
                  <tr className="border-b border-[1px]">
                    <td className="px-5 py-2">{idx + 1}</td>
                    <td className="px-5 py-2 flex">
                      <img
                        src={images[0].url}
                        alt="album-cover"
                        className="h-10 w-10 shadow-sm rounded-sm my-auto"
                      ></img>
                      <a className="my-auto ml-2" href={uri}>
                        {trackData.name}
                      </a>
                    </td>
                    <td className="px-5 py-2">{trackData.artists.join(', ')}</td>
                    <td className="px-5 py-2">{trackData.listens}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TrackList;
