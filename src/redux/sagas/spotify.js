import {delay} from 'redux-saga';
import config from '../../../config/app';
import {select, put, call, take} from 'redux-saga/effects';
import {
	spotifyAuthRequired,
	spotifyAuthInit,
	spotifyAuthOK,
	spotifyProfileRequest,
	spotifyPlayerStateRequest,
	spotifyPlayerStateUpdate,
	actions as spotifyActions
} from '../modules/spotify';
import {socketConnectBegin} from '../modules/socket';

const {webApiBaseUrl, pollPlayerDelay, apiRetryDelay, maxRetry} = config.spotify;
const error401 = '401-unauthorized';

function * beginLogin() {
	const {hash, href} = window.location;
	if (hash) {
		const matches = hash.match(/access_token=(.+)&refresh_token=(.+)/);
		if (matches) {
			const [, accessToken, refreshToken] = matches;
			// we have a hash in our url, so initialise in redux
			yield put(spotifyAuthInit({accessToken, refreshToken}));
			// now get the user's profile information since token might be fake / expired
			// this will throw if there's a problem.
			const profile = yield call(getMyProfile);
			yield put(spotifyAuthOK(profile));
			// ok we have a successful auth, let's open a socket
			yield put(socketConnectBegin());
			// strip the hash so we don't share it accidentally
			history.replaceState({}, document.title,
				href.substr(0, href.length - hash.length));
			return;
		}
	}
	// if we get here we didn't have a login hash from the server, auth step is now required
	yield put(spotifyAuthRequired());
}

function * getMyProfile() {
	yield put(spotifyProfileRequest());
	return yield call(spotifyApiCall, '/v1/me');
}

function * getPlayerState() {
	yield put(spotifyPlayerStateRequest());
	return yield call(spotifyApiCall, '/v1/me/player');
}

function * updatePlayerState() {
	// get player state from api then update redux state with the return
	const playerState = yield getPlayerState();
	if (playerState) {
		yield put(spotifyPlayerStateUpdate(playerState));
	}
}

// this saga runs forever checking the player status
function * pollSpotifyPlayerStatus() {
	while (true) {
		// check state to see if we're logged in
		const {isLoggedIn} = yield select(state => state.spotify);
		if (!isLoggedIn) {
			yield take(spotifyActions.SPOTIFY_AUTH_OK);
		}
		yield call(updatePlayerState);
		yield delay(pollPlayerDelay);
	}
}

function * spotifyApiCall(url, method) {
	const {accessToken} = yield select(state => state.spotify);
	if (!accessToken) {
		// wait for spotify auth to initialise if we don't have an access token yet
		throw new Error('Tried to make spotify api call with no accessToken present');
	}

	yield put({type: spotifyActions.SPOTIFY_API_REQUEST_START, payload: {url}});
	try {
		for (let retryCount = 0; retryCount < maxRetry; retryCount++) {
			const {json, response} = yield fetch(webApiBaseUrl + url, {
				method: method || 'GET',
				headers: {Authorization: `Bearer ${accessToken}`}
			}).then(response => response.text().then(text => ({
					json: text.length > 0 ? JSON.parse(text) : null, // only parse if present
					response
				}))
			).then(({json, response}) => {
				if (response.status === 401) {
					throw new Error(error401);
				}
				if (!response.ok) {
					return Promise.reject(json);
				}
				return {json, response};
			});

			if (json && response.status !== 202) {
				yield put({type: spotifyActions.SPOTIFY_API_REQUEST_OK, payload: {json}});
				return json;
			}

			// 202 accepted or no data, wait several seconds then loop around and retry
			yield delay(apiRetryDelay);
			yield put({type: spotifyActions.SPOTIFY_API_REQUEST_RETRY});
		}

		yield put({
			type: spotifyActions.SPOTIFY_API_REQUEST_ERROR,
			payload: `Spotify API failed after ${maxRetry} retries, aborting.`
		});

		return null;
	} catch (fetchError) {
		if (fetchError.message === error401) {
			yield put({
				type: spotifyActions.SPOTIFY_AUTH_REQUIRED
			});
		}
		yield put({
			type: spotifyActions.SPOTIFY_API_REQUEST_ERROR,
			payload: fetchError.message || 'Unknown Spotify API error' + fetchError
		});
	}
}

function * watchForAuthRequired() {
	while (true) {
		yield take(spotifyActions.SPOTIFY_AUTH_REQUIRED);
		// for now we'll redirect to the login page on the server which will bring us back
		// auth'd with a token in the url hash
		// todo: use refresh token instead of redirect if available
		if (window.location.pathname.indexOf('/error/') === 0) {
			return;
		}
		window.location = `/login?redirectUrl=${escape(window.location.pathname)}&d=${new Date().getTime()}`;
	}
}

export default function * spotifyInit() {
	try {
		yield [
			watchForAuthRequired(),
			beginLogin(),
			pollSpotifyPlayerStatus()
		];
	} catch (err) {
		console.log('unhandled spotify saga error: ' + err);
		throw err;
	}
}
