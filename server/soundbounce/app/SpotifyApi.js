/**
 * Created by paulbarrass on 08/07/2017.
 */
import SpotifyWebApi from 'spotify-web-api-node';
import _debug from 'debug';
const debug = _debug('soundbounce:spotify:api');

import secrets from '../../../config/secrets/secrets';

const spotifyApi = new SpotifyWebApi(secrets.spotify);

class SpotifyAuth {
	constructor() {
		this.access_token = null;
		this.expire = 0;
	}

	checkAuth = () => {
		if (this.access_token === null || Date.now() > this.expire) {
			debug('Spotify: Need new access token, requesting...');
			spotifyApi.setAccessToken(null);
			const promise = spotifyApi.clientCredentialsGrant().then(data => {
				debug('Spotify: New access token ' + data.body['access_token'] + ' expires in ' + data.body['expires_in'] + ' seconds');
				// Save the access token so that it's used in future calls
				this.access_token = data.body['access_token'];
				this.expire = Date.now() + parseInt(data.body['expires_in']) * 1000;
				spotifyApi.setAccessToken(data.body['access_token']);
			}, err => {
				debug('Something went wrong when retrieving an access token', err);
			});

			return promise;
		}
		debug('Spotify: Using access token ' + this.access_token + ' expiring in ' + (this.expire - Date.now()) / 1000 + ' seconds');
		return Promise.resolve();
	};

}
const auth = new SpotifyAuth();
const checkSpotifyApiAuth = auth.checkAuth;

export default spotifyApi;
export {checkSpotifyApiAuth};
