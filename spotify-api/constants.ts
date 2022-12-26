import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const REDIRECT_URI = `http://localhost:${PORT}/callback`;
export const CLIENT_ID = process.env.CLIENT_ID!;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
