import {delay} from 'redux-saga';
import {select, put, call, take} from 'redux-saga/effects';
import {
	spotifyAuthRequired,
	spotifyAuthInit,
	spotifyAuthOK,
	spotifyPlayerStateUpdate,
	actions as spotifyActions
} from '../modules/spotify';
import {socketConnectBegin} from '../modules/socket';

const webApiBaseUrl = 'https://api.spotify.com';
const pollPlayerDelay = 10000; // 2000 (lowered for dev to keep console calm)

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
	return yield call(spotifyApiCall, '/v1/me');
}

function * getPlayerState() {
	return yield spotifyApiCall('/v1/me/player');
}

function * updatePlayerState() {
	// get player state from api then update redux state with the return
	const playerState = yield getPlayerState();
	yield put(spotifyPlayerStateUpdate(playerState));
}

// this saga runs forever checking the player status
function * pollSpotifyPlayerStatus() {
	while (true) {
		// check state to see if we're logged in
		const {isLoggedIn} = yield select(state => state.spotify);
		if (isLoggedIn) {
			yield call(updatePlayerState);
			yield delay(pollPlayerDelay);
		} else {
			// don't wait long to check again to see if we're logged in
			yield delay(200);
		}
	}
}

function * spotifyApiCall(url) {
	const {accessToken} = yield select(state => state.spotify);
	if (!accessToken) {
		// wait for spotify auth to initialise if we don't have an access token yet
		throw new Error('Tried to make spotify api call with no accessToken present');
	}

	yield put({type: spotifyActions.SPOTIFY_API_REQUEST_START, payload: {url}});
	try {
		const json = yield fetch(webApiBaseUrl + url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		})
			.then(response =>
				response.json().then(json => ({json, response}))
			).then(({json, response}) => {
				if (response.code === 401) {
					throw new Error('unauthorised');
				}
				if (!response.ok) {
					return Promise.reject(json);
				}

				return json;
			});
		if (json) {
			yield put({type: spotifyActions.SPOTIFY_API_REQUEST_OK, payload: {json}});
		}

		return json;
	} catch (fetchError) {
		if (fetchError.message === 'unauthorised') {
			yield put({
				type: spotifyActions.SPOTIFY_AUTH_REQUIRED
			});
		}
		yield put({
			type: spotifyActions.SPOTIFY_API_REQUEST_ERROR,
			payload: fetchError.message || 'very bad things'
		});
	}
}

function * watchForAuthRequired() {
	while (true) {
		yield take(spotifyActions.SPOTIFY_AUTH_REQUIRED);
		// for now we'll redirect to the login page on the server which will bring us back
		// auth'd with a token in the url hash
		// todo: use refresh token instead of redirect if available, redirect to previous url
		window.location = '/login';
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
