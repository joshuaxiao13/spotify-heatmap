import * as dotenv from 'dotenv';
dotenv.config();

export const APP_PORT = process.env.APP_PORT || 3000;
export const SERVER_PORT = process.env.SERVER_PORT || 8000;
export const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${APP_PORT}/callback`;
export const API_KEY = process.env.API_KEY || `http://localhost:${SERVER_PORT}`;
export const CLIENT_ID = process.env.CLIENT_ID!;
export const CLIENT_SECRET = process.env.CLIENT_SECRET!;
