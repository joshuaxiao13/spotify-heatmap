import { DayLookup } from 'spotify-api/models/user';

const getPreviousDay = (date: Date) => {
  const previous = new Date(date.getTime());
  previous.setDate(date.getDate() - 1);

  return previous;
};

/**
 * Generates example user listening data for the landing page heatmap example
 * @returns
 */
const genExampleData = (): Record<string, DayLookup> => {
  let currentDate = new Date();
  const exampleData: Record<string, DayLookup> = {};

  for (let i = 0; i < 365; ++i) {
    exampleData[currentDate.toDateString()] = {
      exampleSpotifyUri: {
        name: 'exampleSongTitle',
        artists: [],
        listens: Math.random() > 0.9 ? 0 : Math.floor(Math.random() * 100),
        duration_ms: 2000 * 60 + Math.floor(2 * Math.random() - 1 * 500),
        spotify_id: '',
      },
    };

    currentDate = getPreviousDay(currentDate);
  }

  return exampleData;
};

export default genExampleData;
