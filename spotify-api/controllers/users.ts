import { Request, Response } from 'express';
import Users from '../models/user';
import { fetchRecentlyPlayed, fetchUserProfile, Track } from '../spotifyRequests';

const authenticateSpotifyUser = async (req: Request<{}, any, {}, { id: string }>): Promise<boolean> => {
  return fetchUserProfile(req.headers.authorization!).then((profile) => {
    return profile.id === req.query.id;
  });
};

const createUser = async (
  req: Request<{}, any, {}, { id: string; refresh_token: string }>,
  res: Response
): Promise<void> => {
  if (!req.headers.authorization) {
    res.status(401).send({ msg: 'Authorization missing' });
    return;
  }
  console.log('create user');
  try {
    const userMatchesToken: boolean = await authenticateSpotifyUser(req);
    if (!userMatchesToken) {
      res.status(400).json({ msg: 'Invalid access token' });
      return;
    }

    await Users.create({ id: req.query.id, refresh_token: req.query.refresh_token });
    res.status(201).json({ msg: `user with id: ${req.query.id} successfully created` });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const loginUser = async (req: Request<{}, any, {}, { id: string; refresh_token: string }>, res: Response): Promise<void> => {
  if (!req.headers.authorization) {
    res.status(401).send({ msg: 'Authorization missing' });
    return;
  }
  console.log('Login user ...');
  try {
    const user = await Users.findOneAndUpdate({ id: req.query.id }, { refresh_token: req.query.refresh_token });
    if (user) {
      const userMatchesToken: boolean = await authenticateSpotifyUser(req);
      if (!userMatchesToken) {
        res.status(400).json({ msg: 'Invalid access token' });
        return;
      }
      res.status(201).json({ msg: `Logged in user with id: ${req.query.id}` });
    } else {
      console.log('User does not exist');
      createUser(req, res);
      return;
    }
  } catch (err) {
    res.status(400).json(err);
  }
};

export const deleteUser = async (req: Request<{}, any, {}, { id: string }>, res: Response): Promise<void> => {
  if (!req.headers.authorization) {
    res.status(401).send({ msg: 'Authorization missing' });
    return;
  }
  try {
    const userMatchesToken: boolean = await authenticateSpotifyUser(req);
    if (!userMatchesToken) {
      res.status(400).json({ msg: 'Invalid access token' });
      return;
    }
    const user = await Users.findOneAndDelete({ id: req.query.id });
    if (user) {
      res.status(200).json({
        msg: `Successfully deleted stored data associated with user with id: ${req.query.id}`,
        data: user,
      });
    } else {
      res.status(404).json({
        msg: `No user with id: ${req.query.id} exists`,
      });
    }
  } catch (err) {
    res.status(404).json(err);
  }
};

export const getUserHistory = async (req: Request<{}, any, {}, { id: string }>, res: Response): Promise<void> => {
  if (!req.headers.authorization) {
    res.status(401).send({ msg: 'Authorization missing' });
    return;
  }

  try {
    const userMatchesToken: boolean = await authenticateSpotifyUser(req);
    if (!userMatchesToken) {
      res.status(400).json({ msg: 'Invalid access token' });
      return;
    }

    console.log('GET user with id', req.query.id, '...');
    const user = await Users.findOne({ id: req.query.id });
    if (user) {
      res.status(200).json({ history: user.history });
    } else {
      res.status(204).json({ msg: 'No Content' });
    }
  } catch (err) {
    res.status(404).json(err);
  }
};

export const updateHistory = async (req: Request<{}, any, {}, { id: string }>, res: Response): Promise<void> => {
  if (!req.headers.authorization) {
    res.status(401).send({ msg: 'Authorization missing' });
    return;
  }

  try {
    const userMatchesToken: boolean = await authenticateSpotifyUser(req);
    if (!userMatchesToken) {
      res.status(400).json({ msg: 'Invalid access token' });
      return;
    }
    const user = await Users.findOne({ id: req.query.id });
    if (!user) {
      res.status(400).send({ msg: 'Invalid id. User does not exist' });
      return;
    }
    fetchRecentlyPlayed(req.headers.authorization)
      .then(async (tracks: Track[]) => {
        const history = user.history || {};

        if (tracks && tracks.length > 0) {
          const last_recorded_timestamp = new Date(user.previous_timestamp);
          let counter = 0;

          for (const track of tracks) {
            const date = new Date(track.played_at);
            if (date <= last_recorded_timestamp) {
              break;
            }

            console.log(`Logging ${req.query.id}:`, track.name, '#', ++counter);

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
                spotify_id: track.spotify_id
              };
            }

            history[date.toDateString()] = dayLookUp;
          }

          try {
            // user with id guranteed to exist, condition checked in Users.findOne operation above
            const updatedUser = await Users.findOneAndUpdate(
              { id: req.query.id },
              { $set: { history: history, previous_timestamp: tracks[0]!.played_at } },
              { new: true }
            );
            res.status(200).json({ data: updatedUser!.history });
          } catch (err) {
            console.log('Possible mongoserver error ... ?');
            res.status(400).json({ msg: err });
          }
        }
      })
      .catch((err) => {
        res.status(400).json({ msg: err });
      });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
