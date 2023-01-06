export const PORT: string | number = process.env.PORT || 3000;
export const REDIRECT_URI: string = process.env.REDIRECT_URI || `http://localhost:${PORT}/callback`;
// TODO: 8000 for dev
export const API_KEY: string =
  process.env.API_KEY || `http://localhost:${process.env.NODE_ENV === 'development' ? 8000 : PORT}/api/v1`;
export const CLIENT_ID: string = process.env.CLIENT_ID!;
export const CLIENT_SECRET: string = process.env.CLIENT_SECRET!;
