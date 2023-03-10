import { useEffect, useState } from 'react';
import { DayLookup, TrackData } from 'spotify-api/models/user';
import { ArtistPlaceHolder } from '../icons/ArtistPlaceHolder';
import HoverPopup from './HoverPopup';

type fetchTrackImagesFun = (spotifyIdList: string[]) => Promise<SpotifyApi.ImageObject[][]>;
type fetchArtistImagesFun = (spotifyIdList: string[]) => Promise<SpotifyApi.ImageObject[][][]>;

type mostListensThisWeekResponse = [
  {
    uri: string;
    images: {
      album: SpotifyApi.ImageObject[];
      artists: SpotifyApi.ImageObject[][];
    };
  },
  TrackData
][];

async function mostListensThisWeek(
  history: Record<string, DayLookup>,
  fetchTrackImagesById: fetchTrackImagesFun,
  fetchArtistImagesById: fetchArtistImagesFun
): Promise<mostListensThisWeekResponse> {
  const trackToListens = new Map<string, number>();
  const trackToInfo = new Map<string, TrackData>();

  Object.entries(history).forEach(([_, lookup]) => {
    Object.entries(lookup).forEach(([trackUri, trackData]) => {
      const accumulatedListens: number = trackToListens.get(trackUri) || 0;
      if (accumulatedListens === 0) {
        trackToInfo.set(trackUri, trackData);
      }
      trackToListens.set(trackUri, trackData.listens + accumulatedListens);
    });
  });

  const trackToListensList: [string, number][] = Array.from(trackToListens).sort((a, b) => b[1] - a[1]);
  const topTracks: [string, TrackData][] = trackToListensList
    .reduce<[string, TrackData][]>((acc, [trackUri, listens]) => {
      const data = trackToInfo.get(trackUri)!;
      if (data.spotify_id === undefined) return acc;
      return [...acc, [trackUri, { ...data, listens: listens }]];
    }, [])
    .slice(0, 10);

  const [albumImageObjects, artistImageObjects] = await Promise.all([
    fetchTrackImagesById(topTracks.map(([_, data]) => data.spotify_id)),
    fetchArtistImagesById(topTracks.map(([_, data]) => data.spotify_id)),
  ]);

  return topTracks.map(([uri, data], idx) => [
    {
      uri: uri,
      images: {
        album: albumImageObjects[idx],
        artists: artistImageObjects[idx],
      },
    },
    data,
  ]);
}

interface TrackListProps {
  data: { history: Record<string, DayLookup>; day: string } | undefined;
  fetchTrackImagesById: fetchTrackImagesFun | undefined;
  fetchArtistImagesById: fetchArtistImagesFun | undefined;
}

const TrackList = ({ data, fetchTrackImagesById, fetchArtistImagesById }: TrackListProps) => {
  const [trackList, setTrackList] = useState<mostListensThisWeekResponse>();
  const [artistHoverState, setArtistHoverState] = useState<{ [k: string]: Boolean }>();

  useEffect(() => {
    if (data?.history && fetchTrackImagesById && fetchArtistImagesById) {
      mostListensThisWeek(data.history, fetchTrackImagesById, fetchArtistImagesById)
        .then((res) => setTrackList(res))
        .catch((e) => {
          console.log(e);
        });
    }
  }, [data, fetchTrackImagesById, fetchArtistImagesById]);

  if (!(data && fetchTrackImagesById) || !trackList) return <></>;

  return (
    <>
      <h2 id="recentActivity" className="text-center dark:text-gray-300">
        Activity {data.day}
      </h2>
      <div className="w-2/3 pt-5 my-2 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 mx-auto relative overflow-x-auto">
        <table className="border-collapse table-auto w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium text-gray-500 dark:text-gray-300 dark:border-gray-700">
              <th className="px-5 py-2">#</th>
              <th className="px-5 py-2">Track Title</th>
              <th className="px-5 py-2">Artists</th>
              <th className="px-5 py-2">Listens</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-200 shadow-md text-sm">
            {trackList &&
              trackList.map(([{ uri, images }, trackData], idx1) => {
                return (
                  <tr className="border-b border-[1px] dark:border-gray-700 " key={idx1}>
                    <td className="px-5 py-2">{idx1 + 1}</td>
                    <td className="px-5 py-2">
                      <a className="my-auto ml-2 flex gap-x-2" href={uri}>
                        <img
                          src={images.album[0].url}
                          alt="album-cover"
                          className="h-10 w-10 shadow-sm rounded-md my-auto"
                        ></img>
                        <span className="my-auto">{trackData.name}</span>
                      </a>
                    </td>
                    <td className="px-5 py-2 ">
                      <div className="flex -space-x-4 dark:border-gray-700">
                        {images.artists.map((artistImageObj, idx2) => {
                          const artistName = trackData.artists[idx2];
                          const id = `artist-${idx1}-${idx2}`;
                          return (
                            <div
                              onMouseEnter={() => setArtistHoverState((prev) => ({ ...prev, [id]: true }))}
                              onMouseLeave={() => setArtistHoverState((prev) => ({ ...prev, [id]: false }))}
                              key={`${idx1}-${idx2}`}
                            >
                              {artistHoverState && artistHoverState[id] && (
                                <HoverPopup textList={[artistName]}></HoverPopup>
                              )}
                              {!artistImageObj[0] ? (
                                <ArtistPlaceHolder id={id} />
                              ) : (
                                <img
                                  id={id}
                                  src={artistImageObj[0].url}
                                  alt={`artist ${artistName}`}
                                  className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-800"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
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
