/**
 * Created by pb on 14/04/2017.
 */
import request from 'request';
import querystring from 'querystring';
import secrets from '../../config/secrets/secrets';
import randomString from './util/randomString';

const stateKey = 'spotify_auth_state';

const spotifyScopes = [
	'user-read-playback-state',
	'user-modify-playback-state',
	'playlist-read-private',
	'playlist-read-collaborative',
	'playlist-modify-public',
	'playlist-modify-private',
	'user-follow-modify',
	'user-follow-read',
	'user-library-read',
	'user-library-modify',
	'user-read-private',
	'user-read-birthdate',
	'user-read-email',
	'user-top-read'
];

export default (app) => {
	app.get('/login', function(req, res) {

		const state = randomString(16);

		res.cookie(stateKey, state);

		// your application requests authorization
		res.redirect('https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: secrets.spotify.clientId,
				scope: spotifyScopes.join(' '),
				redirect_uri: secrets.spotify.redirectUri,
				state: state
			}));
	});

	app.get('/spotify-oauth-callback', function(req, res) {
		const {code, state} = req.query;
		const  storedState = req.cookies ? req.cookies[stateKey] : null;
		if (state === null || state !== storedState) {
			res.redirect('/#' +
				querystring.stringify({
					error: 'state_mismatch'
				}));
		} else {
			res.clearCookie(stateKey);
			var authOptions = {
				url: 'https://accounts.spotify.com/api/token',
				form: {
					code: code,
					redirect_uri: secrets.spotify.redirectUri,
					grant_type: 'authorization_code'
				},
				headers: {
					'Authorization': 'Basic ' +
					(new Buffer(secrets.spotify.clientId + ':' + secrets.spotify.clientSecret).toString('base64'))
				},
				json: true
			};

			request.post(authOptions, function(error, response, body) {
				if (!error && response.statusCode === 200) {

					const accessToken = body.access_token,
						refreshToken = body.refresh_token;

					var options = {
						// url: 'https://api.spotify.com/v1/me',
						url: 'https://api.spotify.com/v1/me/player/devices',
						headers: { 'Authorization': 'Bearer ' + accessToken },
						json: true
					};

					// use the access token to access the Spotify Web API
					request.get(options, function(error, response, body) {
						console.log(body);
					});

					// we can also pass the token to the browser to make requests from there
					res.redirect('/#' +
						querystring.stringify({
							access_token: accessToken,
							refresh_token: refreshToken
						}));
				} else {
					res.redirect('/#' +
						querystring.stringify({
							error: 'invalid_token'
						}));
				}
			});
		}
	});
};
