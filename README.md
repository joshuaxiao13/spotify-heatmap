# Spotify Heatmap

## Overview

Spotify Heatmap is a tool to visualize your Spotify listening history and convert YouTube playlists to Spotify ones. Find the number of streams and the hours you spent listening on Spotify for any given day in the past year (provided that the day is after the day you first login). Try converting your favourite YouTube playlist and browse through the playlist with Spotify's UI instead.

<img alt='demo-screenshot' src='/assets/heatmap-screenshot.jpg'></img>

It uses the Spotify Web API to request the 50 most recently played tracks and stores the data in a database. This project mainly uses Typescript React, Express, and TailwindCSS for styling. You can find the demo on [spotify-heatmap.onrender.com](https://spotify-heatmap.onrender.com). The app is in Development Mode, which means **users can access the app only if they are listed under the users list on the Spotify Dashboard**. The other option is run the app locally by following the steps below.

<img alt='demo-screenshot' src='/assets/playlist-screenshot.jpg'></img>

## Setup Local Environment

1. Clone the repository.

```sh
git clone https://github.com/joshuaxiao13/spotify-heatmap.git
```

2. Install Node `v18.12.1`. If you have [Node Version Manager](https://github.com/nvm-sh/nvm) installed, you can install the desired version of Node with:

```sh
nvm use
```

3. Assuming you are in the root directory, navigate to the `spotify-api` directory, copy `.env.template`, and rename the copied file to `.env`.

```sh
cd spotify-api
cp .env.template .env
```

5. Head over to [MongoDB](`https://www.mongodb.com/`) and create a new cluster. Record the MongoURI by navigating to the Database tab > Connect > Connect your application (it should be prefixed by `mongodb+srv:`)

6. Login to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and Create An App. Record the app's Client ID and Client Secret.

7. While still on the Spotify Developer Dashboard, navigate to Edit Settings and under Redirect URIs, add `https://localhost:<PORT>/callback` where `<PORT>` should match `process.env.PORT`. If you don't define `process.env.PORT`, then enter `https://localhost:3000/callback`. Under Users and Access, add the email address connected to your Spotify Account. This must be done to access the app.

8. Follow steps 1 to 3 on this [page](https://developers.google.com/youtube/v3/getting-started#:~:text=You%20need%20a,API%20v3.) to retrieve an API key from the Google Developers Console (this will be used to make requests to the Youtube V3 API when converting a Youtube Playlist to a Spotify Playlist). In particular, make sure the status is **ON** for the **YouTube Data API v3** in the list of enabled APIs for the key you create.

9. Paste the MongoURI, Spotify Client ID, Client Secret, and Google API key into `.env`.

```env
# spotify client id (found in spotify developer dashboard)
SPOTIFY_CLIENT_ID=[paste Client Id]

# spotify client secret (found in spotify developer dashboard)
SPOTIFY_CLIENT_SECRET=[paste Client Secret]

# mongodb access uri
MONGODB_URI=[paste MongoURI]

# Google Developer Console API key
GOOGLE_CLIENT_SECRET=[paste Google Client Secret]
```

10. In the project's root directory, run:

```sh
npm run install:all
```

This will install all required dependencies.

## Build and Serve Locally

Build the frontend and start the server. Assuming you're in the project's root directory you can either

```sh
cd spotify-api && npm run build:frontend && npm start
```

## Run Client & Server For Development

To avoid building the frontend after every change in the `client` directory, run

```sh
cd spotify-api && npm run start:server
```

and in another tab, run

```sh
cd client && npm start
```

Any changes you make to the client should now automatically reflect in the browser window.

## Deploy

Set `process.env.REACT_REDIRECT_URI` and update the redirect url on the Spotify Developer Dashboard accordingly.
The script to start the app should be something similar to

```sh
cd spotify-api && NODE_ENV=production npx ts-node app.ts
```

## Unix Users

Edit `spotify-api/package.json` `start:server` script to

```sh
'scripts': {
  ...
      "start:server" : 'NODE_ENV=development nodemon server.ts',
 ...
 }
```
