export const PORT = process.env.PORT || 3000;
export const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${PORT}/callback`;
// TODO: 8000 for dev
export const API_KEY =
  process.env.API_KEY || `http://localhost:${process.env.NODE_ENV === 'development' ? 8000 : PORT}/api/v1`;
export const CLIENT_ID = process.env.CLIENT_ID!;
export const CLIENT_SECRET = process.env.CLIENT_SECRET!;
