export const PORT: string | number = process.env.PORT || 3000;
export const DEV_SEVER_PORT = 8000;
export const REDIRECT_URI: string = process.env.REDIRECT_URI || `http://localhost:${PORT}/callback`;
export const API_KEY: string =
  process.env.REACT_APP_API_KEY ||
  `http://localhost:${process.env.NODE_ENV === 'development' ? DEV_SEVER_PORT : PORT}/api/v1`;
export const SPOTIFY_CLIENT_ID: string = process.env.SPOTIFY_CLIENT_ID!;
export const SPOTIFY_CLIENT_SECRET: string = process.env.SPOTIFY_CLIENT_SECRET!;
export const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET!;
