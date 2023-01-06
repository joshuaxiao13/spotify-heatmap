import mongoose from 'mongoose';

export interface TrackData {
  name: string;
  artists: string[];
  duration_ms: number;
  listens: number;
  spotify_id: string;
}

export type DayLookup = Record<string, TrackData>;

interface User {
  id: string;
  refresh_token: string;
  previous_timestamp: Date;
  history: Record<string, DayLookup>;
}

export const TrackDataSchema = new mongoose.Schema<TrackData>({
  name: {
    type: String,
    required: true,
  },
  artists: [String],
  duration_ms: {
    type: Number,
    required: true,
  },
  listens: {
    type: Number,
    required: true,
    default: 0,
  },
});

const DayLookupSchema: mongoose.SchemaDefinitionProperty<DayLookup> = {
  type: Object,
  of: TrackDataSchema,
};

const UserSchema = new mongoose.Schema<User>({
  id: {
    // spotify unique id
    type: String,
    required: true,
    unique: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  previous_timestamp: {
    type: Date,
    default: new Date(0),
  },
  history: {
    type: Object,
    of: DayLookupSchema,
    default: {},
  },
});

export default mongoose.model<User>('Users', UserSchema);
