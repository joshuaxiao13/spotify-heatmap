import { useEffect, useState } from 'react';
import { DayLookup, TrackData } from 'spotify-api/models/user';
import { ArtistPlaceHolder } from '../icons/ArtistPlaceHolder';
import HoverPopup from './HoverPopup';

type fetchTrackImagesFun = (spotifyIdList: string[]) => Promise<SpotifyApi.ImageObject[][]>;

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
  fetchArtistImagesById: any
): Promise<mostListensThisWeekResponse> {
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
  history: Record<string, DayLookup> | undefined;
  fetchTrackImagesById: fetchTrackImagesFun | undefined;
  fetchArtistImagesById: any;
}

const TrackList = ({ history, fetchTrackImagesById, fetchArtistImagesById }: TrackListProps) => {
  const [trackList, setTrackList] = useState<mostListensThisWeekResponse>();
  const [artistHoverState, setArtistHoverState] = useState<{ [k: string]: Boolean }>();

  useEffect(() => {
    if (history && fetchTrackImagesById) {
      mostListensThisWeek(history, fetchTrackImagesById, fetchArtistImagesById)
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
              <th className="px-5 py-2">Artists</th>
              <th className="px-5 py-2">Listens</th>
            </tr>
          </thead>
          <tbody className="bg-white text-gray-600 shadow-md text-sm">
            {history &&
              trackList.map(([{ uri, images }, trackData], idx1) => {
                return (
                  <tr className="border-b border-[1px]">
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
                    <td className="px-5 py-2">
                      <div className="flex -space-x-4">
                        {images.artists.map((artistImageObj, idx2) => {
                          const artistName = trackData.artists[idx2];
                          const id = `artist-${idx1}-${idx2}`;
                          return (
                            <div
                              onMouseEnter={() => setArtistHoverState((prev) => ({ ...prev, [id]: true }))}
                              onMouseLeave={() => setArtistHoverState((prev) => ({ ...prev, [id]: false }))}
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
