import { Request, Router } from 'express';
import axios, { AxiosResponse } from 'axios';
import { generateRandomString, queryParamsStringify } from '../utils';
import { API_KEY, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from '../constants';
import { fetchUserProfile } from '../spotifyRequests';

const router = Router();

interface RequestUserAuthorizationQueryParams extends Record<string, string | undefined> {
  client_id: string;
  response_type: 'code';
  redirect_uri: string;
  state?: string;
  scope?: string;
  show_dialog?: 'true' | 'false';
}

interface AccessTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  scope: string;
  expires_in: number;
  refresh_token: string;
}

interface AccessTokenRequestBodyParams {
  grant_type: 'authorization_code';
  code: string;
  redirect_uri: string;
}

router.get('/login', function (req, res) {
  const scope = [
    'user-read-currently-playing',
    'user-read-private',
    'user-read-recently-played',
    'user-read-currently-playing',
  ].join(' ');

  const params: RequestUserAuthorizationQueryParams = {
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: generateRandomString(),
    show_dialog: 'true',
  };

  res.redirect(queryParamsStringify('https://accounts.spotify.com/authorize', params));
});

router.get('/callback', function (req: Request<{}, {}, {}, { code: string; state: string }>, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (code === null) {
    res.redirect('/fail?error=code_not_supplied');
  } else if (state === null) {
    res.redirect('/fail?error=state_mismatch');
  } else {
    axios
      .post<AccessTokenResponse, AxiosResponse<AccessTokenResponse>, AccessTokenRequestBodyParams>(
        'https://accounts.spotify.com/api/token',
        {
          grant_type: 'authorization_code',
          code: code!,
          redirect_uri: REDIRECT_URI,
        },
        {
          headers: {
            // prettier-ignore
            Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .then(async (response) => {
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

        const profile = await fetchUserProfile(accessToken);

        axios.post(queryParamsStringify(`${API_KEY}/user`, { id: profile.id, refresh_token: refreshToken }), null, {
          headers: {
            Authorization: accessToken,
          },
        });

        res.redirect(queryParamsStringify('/user', { access_token: accessToken, refresh_token: refreshToken }));
      })
      .catch((err) => {
        console.log('Failed to get access token.');
        const data = err.response.data;
        if (data.error === 'access_denied' || state !== data.state) {
          console.log('Access denied, redirecting user to login page.');
          res.redirect('/');
        } else {
          throw new Error(data);
        }
      });
  }
});

export default router;
