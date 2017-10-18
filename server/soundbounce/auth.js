/**
 * Created by pb on 14/04/2017.
 */
import request from 'request';
import querystring from 'querystring';
import secrets from '../../config/secrets/secrets';
import randomString from './util/randomString';
import _debug from 'debug';
const debug = _debug('soundbounce:auth');

const stateKey = 'spotify_auth_state',
	spotifyScopes = [
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
	app.get('/login', (req, res) => {
		const state = randomString(16);

		res.cookie(stateKey, state);

		if (req.query.redirectUrl) {
			res.cookie('redirectUrl', req.query.redirectUrl);
		}

		// request authorization from spotify
		res.redirect('https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: secrets.spotify.clientId,
				scope: spotifyScopes.join(' '),
				redirect_uri: secrets.spotify.redirectUri,
				state: state
			}));
	});

	// spotify will reply on this endpoint (malicious users won't know the secret state)
	app.get('/spotify-oauth-callback', (req, res) => {
		const {code, state} = req.query;
		const storedState = req.cookies ? req.cookies[stateKey] : null;
		if (storedState && (state === null || state !== storedState)) {
			res.redirect('/error/invalid-oauth-state?state=' + encodeURIComponent(state) +
				'&storedState=' + encodeURIComponent(storedState));
		} else {
			res.clearCookie(stateKey);
			const authOptions = {
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

			request.post(authOptions, (error, response, body) => {
					if (!error && response.statusCode === 200) {
						const accessToken = body.access_token,
							refreshToken = body.refresh_token,
							expires = body['expires_in'];

						const redirectUrl = req.cookies ? req.cookies['redirectUrl'] : null;
						if (redirectUrl) {
							res.clearCookie('redirectUrl');
						}

						const profileOptions = {
							url: 'https://api.spotify.com/v1/me',
							headers: {'Authorization': 'Bearer ' + accessToken},
							json: true
						};

						// use the access token to access the Spotify Web API
						request.get(profileOptions, (error, response, profile) => {

							// create the user if it doesn't exist
							app.users
								.loginUser({profile, accessToken, refreshToken})
								.then(user => {
									// pass the token to the browser to make requests from there
									res.redirect((redirectUrl || '/') + '#' +
										querystring.stringify({
											access_token: accessToken,
											refresh_token: refreshToken,
											expires
										}));
								})

						});
					}
					else {
						res.redirect('/error/invalid-token');
					}
				}
			);
		}
	});

	app.get('/spotify-token-refresh', (req, res) => {
		const {token} = req.query;
		const authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				refresh_token: token,
				grant_type: 'refresh_token'
			},
			headers: {
				'Authorization': 'Basic ' +
				(new Buffer(secrets.spotify.clientId + ':' + secrets.spotify.clientSecret).toString('base64'))
			},
			json: true
		};

		request.post(authOptions, (error, response, body) => {
				if (!error && response.statusCode === 200) {
					res.write(JSON.stringify(body));
					res.end();
				}
				else {
					res.redirect('/error/invalid-token');
				}
			}
		);
	});
};
