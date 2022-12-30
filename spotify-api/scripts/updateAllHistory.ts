import Users from '../models/user';
import { fetchRecentlyPlayed, refreshAccessToken, Track } from '../spotifyRequests';

/**
 * Updates listening history for all users in the DB
 * Code here is similar to updateUser in controllers/users.ts
 */
const updateAllUsers = async (): Promise<void> => {
  try {
    const users = await Users.find({});
    users.forEach((user) => {
      refreshAccessToken(user.refresh_token).then((access_token) => {
        fetchRecentlyPlayed(access_token)
          .then(async (tracks: Track[]) => {
            console.log(new Date(), 'Updating user with id:', user.id);
            const history = user.history || {};

            if (tracks && tracks.length > 0) {
              const last_recorded_timestamp = new Date(user.previous_timestamp);
              let counter = 0;
              for (const track of tracks) {
                const date = new Date(track.played_at);

                if (date <= last_recorded_timestamp) {
                  break;
                }

                console.log(new Date(), `Logging ${user.id}:`, track.name, '#', ++counter);

                const dayLookUp = history[date.toDateString()] || {};
                const prev = dayLookUp[track.uri];

                if (prev) {
                  dayLookUp[track.uri] = { ...prev, listens: prev.listens + 1 };
                } else {
                  dayLookUp[track.uri] = {
                    name: track.name,
                    artists: track.artists,
                    duration_ms: track.duration_ms,
                    listens: 1,
                  };
                }

                history[date.toDateString()] = dayLookUp;
              }

              // user with id guranteed to exist, condition checked in Users.findOne operation above
              await Users.findOneAndUpdate(
                { id: user.id },
                { $set: { history: history, previous_timestamp: tracks[0]!.played_at } },
                { new: true }
              ).catch((err) => {
                console.log('Possible mongoserver error ... ?');
                console.log(err);
              });
            }
          })
          .then(() => {
            console.log(new Date(), 'Finished updating user with id:', user.id);
          })
          .catch((err) => {
            console.log(err);
          });
      });
    });
  } catch (err) {
    console.log(err);
  }
};

export default updateAllUsers;
