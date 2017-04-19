import {delay} from 'redux-saga';
import {select, put, call} from 'redux-saga/effects';
import {
	spotifyAuthInit,
	spotifyAuthOK,
	spotifyPlayerStateUpdate,
	actions
} from '../modules/spotify';

const webApiBaseUrl = 'https://api.spotify.com';

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

			console.log(yield getPlayerState());
			// strip the hash so we don't share it accidentally
			history.replaceState({}, document.title,
				href.substr(0, href.length - hash.length));
		}
	} else {
		// redirect to oauth login on server because the app just started but
		// there was no access token in hash
		window.location = '/login';
	}
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
			yield delay(2000);
		}
		else {
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

	yield put({type: actions.SPOTIFY_API_REQUEST_START, payload: {url}});
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
				if (!response.ok) {
					return Promise.reject(json);
				}
				return json;
			});
		if (json) {
			yield put({type: actions.SPOTIFY_API_REQUEST_OK, payload: {json}});
		}

		return json;
	} catch (fetchError) {
		yield put({
			type: actions.SPOTIFY_API_REQUEST_ERROR,
			payload: fetchError.message || 'very bad things'
		});
	}
}

export default function * spotifyInit() {
	try {
		yield [
			beginLogin(),
			pollSpotifyPlayerStatus()
		];
	} catch (err) {
		console.log('unhandled spotify saga error: ' + err);
	}
}
