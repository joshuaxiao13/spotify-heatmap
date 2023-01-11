# Spotify Heatmap

## Overview

Spotify Heatmap is a tool to visualize your Spotify listening history in the form of a heatmap. You can find the number of streams and the hours you spent listening on Spotify for any given day in the past year (provided that the day is after the day you first login). It uses the Spotify Web API to request the 50 most recently played tracks and stores the data in a database. This project mainly uses Typescript React, Express, and TailwindCSS for styling. You can find the demo on [spotify-heatmap.onrender.com](https://spotify-heatmap.onrender.com).

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

7. While still on the Spotify Developer Dashboard, navigate to Edit Settings and under Redirect URIs, add `https://localhost:<PORT>/callback` where `<PORT>` should match `process.env.PORT`. If you don't define `process.env.PORT`, then enter `https://localhost:3000/callback`.

8. Paste the MongoURI and Spotify Client ID and Client Secret into `.env`.

```env
# spotify client id (found in spotify developer dashboard)
CLIENT_ID=[paste Client Id]

# spotify client secret (found in spotify developer dashboard)
CLIENT_SECRET=[paste Client Secret]

# mongodb access uri
MONGODB_URI=[paste MongoURI]

```

9. In the project's root directory, run:

```sh
npm run install:all
```

This will install all required dependencies.

## Build and Serve Locally

Build the frontend and start the server. Assuming you're in the project's root directory you can either

```sh
cd client && npm run build
cd ../spotify-api
npm start
```

or

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
