import {delay} from 'redux-saga';
import config from '../../../config/app';
import {select, put, call, take, all, fork} from 'redux-saga/effects';
import {
	spotifyAuthRequired,
	spotifyAuthInit,
	spotifyAuthOK,
	spotifyProfileRequest,
	spotifyPlayerStateRequest,
	spotifyPlayerStateUpdate,
	spotifyPlayTrack,
	spotifyDisableShuffle,
	spotifyDevicesUpdate,
	spotifySearchUpdate,
	spotifyMyPlaylistsUpdate,
	spotifyMyPlaylistsRequest,
	actions as spotifyActions, spotifyAudioAnalysisUpdate, spotifyRecommendationsUpdate,
	spotifyFullAlbumUpdate, spotifyFullAlbumRequest
} from '../modules/spotify';
import {actions as roomActions} from '../modules/shared/room';
import {
	syncStartFail, syncStop, syncStartOk, actions as syncActions,
	syncStart, SYNC_STOP
} from '../modules/sync';
import {socketConnectBegin} from '../modules/socket';
import moment from 'moment';
import _ from 'lodash';

const {webApiBaseUrl, pollPlayerDelay, apiRetryDelay, maxRetry} = config.spotify;
const error401 = '401-unauthorized';

function * beginLogin() {
	// pull the spotify access tokens from the hash fragment of the url
	const {hash, href} = window.location;
	if (hash) {
		const matches = hash.match(/access_token=(.+)&refresh_token=(.+)&expires=(.+)/);
		if (matches) {
			const [, accessToken, refreshToken, expires] = matches;
			// we have a hash in our url, so initialise in redux
			yield put(spotifyAuthInit({accessToken, refreshToken, expires}));
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
	return yield call(spotifyApiCall, {url: '/v1/me'});
}

function * getPlayerState() {
	yield put(spotifyPlayerStateRequest());
	return yield call(spotifyApiCall, {url: '/v1/me/player'});
}

function * updatePlayerState() {
	// get player state from api then update redux state with the return
	const playerState = yield getPlayerState();
	if (playerState) {
		yield put(spotifyPlayerStateUpdate({...playerState, updateArrivedAt: moment().valueOf()}));
	}
}

function * checkSyncStatus() {
	const {room, sync, spotify} = yield select(state => state);
	if (room.playlist.length > 0) {
		if (sync.isSynced) {
			const {player} = spotify;
			if (!player.is_playing) {
				// player has stopped but we're supposed to be synced, stop sync
				yield put(syncStop('Spotify playback was paused.'));
				return;
			}

			if (config.player.strictSync) {
				const nowPlayingProgress = moment().valueOf() -
					room.nowPlayingStartedAt - sync.serverMsOffset;
				// we're playing! but are we playing the correct track?
				if (player.item.id !== room.playlist[0].id) {
					// spotify might be playing the end of the track that we were just listening to...
					// so isn't a desync if we're within the maxDrift of the next song!
					if (nowPlayingProgress < config.player.maxDriftConsideredSynced) {
						if (room.recentlyPlayed.length > 0) {
							if (player.item.id === room.recentlyPlayed[room.recentlyPlayed.length - 1].id) {
								// this is ok (not desync), so return to caller
								console.log('keeping synced, spotify track behind within max drift ');
								return;
							}
						}
					}
					// spotify might be slightly ahead - playing the beginning of the next track
					// when playlist is at end of previous.  this is also not a desync
					if (spotify.tracks[room.playlist[0].id].duration -
						nowPlayingProgress < config.player.maxDriftConsideredSynced) {
						if (room.playlist.length > 1) {
							// is this track in the playlist anywhere
							// it could have been the next track when we last queued, but not anymore
							for (let playlistTrack of room.playlist) {
								if (playlistTrack.id === player.item.id) {
									console.log('keeping synced, spotify track ahead within max drift');
									return;
								}
							}
						}
					}

					yield put(syncStop(`A different track was playing.
				Expected '${room.playlist[0].id}' @${nowPlayingProgress}ms,
				but detected '${player.item.id}' @${player.progress_ms}ms.
				last played: [${room.recentlyPlayed.map(r => r.id).join(',')}].
				playlist: [${_.take(room.playlist, 3).map(t => t.id).join(',')}]`));
					return;
				}
				// OK so correct track, but it is reasonable track position?
				const drift = Math.abs(nowPlayingProgress - player.progress_ms);
				if (drift > config.player.maxDriftConsideredSynced) {
					yield put(syncStop('Song position changed..'));
					return;
				}
			}
		}
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
		try {
			yield call(updatePlayerState);
			yield call(checkSyncStatus);
		} catch (playerStateError) {
			// todo: this is a sync failure if we can't get playerstate (this is after retries)
		}
		yield delay(pollPlayerDelay);
	}
}

function * spotifyDisableShuffleIfEnabled() {
	const {player} = yield select(state => state.spotify);
	if (player && player.shuffle_state) {
		yield put(spotifyDisableShuffle());
		// disable shuffle first
		yield call(spotifyApiCall, {
			url: '/v1/me/player/shuffle?state=false',
			method: 'PUT'
		});
	}
}

function * spotifyPlayTracksThenSeek({trackIds, seekPosition}) {
	yield put(spotifyPlayTrack({trackIds, seekPosition}));
	// make sure shuffle hasn't been switched on
	yield call(spotifyDisableShuffleIfEnabled);
	// tell spotify to play
	yield call(spotifyApiCall, {
		url: '/v1/me/player/play',
		method: 'PUT',
		body: JSON.stringify({uris: trackIds.map(tid => `spotify:track:${tid}`)})
	});

	if (seekPosition > config.spotify.minSeekFromStart) {
		// now play call is complete (the above is 'blocking' so device should be playing), now seek!
		yield call(spotifyApiCall, {
			url: `/v1/me/player/seek?position_ms=${seekPosition}`,
			method: 'PUT'
		});
	}
}

function * watchForSyncStart() {
	while (true) {
		yield take(syncActions.SYNC_START);
		const {room, sync} = yield select(state => state);

		if (!room || !room.id) {
			yield put(syncStartFail({
				error: 'No room to sync to.'
			}));
			continue;
		}
		if (room.playlist.length === 0) {
			yield put(syncStartFail({error: 'No music in room to sync to'}));
			continue;
		}

		// play the top track in the room
		const seekPosition = moment().valueOf() - room.nowPlayingStartedAt - sync.serverMsOffset;

		yield call(spotifyPlayTracksThenSeek, {
			trackIds: _.take(room.playlist, config.player.maxTracksToQueueWhenPlaying).map(t => t.id),
			seekPosition
		});

		// we're synced once that call above returns
		yield put(syncStartOk());
	}
}

// play the track if now playing in room changes and we're synced
function * watchForRoomNowPlayingChanged() {
	while (true) {
		const {payload: {trackIds}} = yield take(roomActions.ROOM_NOW_PLAYING_CHANGED);
		const {isSynced, isSyncing} = yield select(state => state.sync);
		if (isSynced || isSyncing) {
			yield call(spotifyPlayTracksThenSeek, {trackIds, seekPosition: 0});
		}
	}
}

function * watchForPreviewTrack() {
	while (true) {
		const {payload: {trackId, offset}} = yield take(spotifyActions.SPOTIFY_PREVIEW_TRACK);
		const {tracks} = yield select(state => state.spotify);
		yield call(spotifyPlayTracksThenSeek, {
			trackIds: [trackId],
			// seek to 1/3 through for preview
			seekPosition: offset || Math.round((tracks[trackId].duration ||
				tracks[trackId].duration_ms) / 3)
		});
	}
}

function * spotifyApiCall({url, method, body}) {
	let baseUrl = webApiBaseUrl;
	if (url.indexOf('https') === 0) {
		baseUrl = '';
	}
	const {accessToken} = yield select(state => state.spotify);
	if (!accessToken) {
		// wait for spotify auth to initialise if we don't have an access token yet
		throw new Error('Tried to make spotify api call with no accessToken present');
	}

	yield put({type: spotifyActions.SPOTIFY_API_REQUEST_START, payload: {url}});
	try {
		for (let retryCount = 0; retryCount < maxRetry; retryCount++) {
			const {json, response} = yield fetch(baseUrl + url, {
				method: method || 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				},
				body
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

			// 204 no content is fine for some calls (like play track)
			if (response.status === 204 || (json && response.status !== 202)) {
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
		// redirect to the login page on the server which will bring us back
		// auth'd with a token in the url hash
		if (window.location.pathname.indexOf('/error/') === 0) {
			return;
		}
		window.location = `/login?redirectUrl=${escape(window.location.pathname)}&d=${new Date().getTime()}`;
	}
}

function * waitForAuthExpires() {
	let {payload: {expires, refreshToken, accessToken}} =
		yield take(spotifyActions.SPOTIFY_AUTH_INIT);

	while (true) {
		// wait for the token to almost expire (999 instead of 1000)
		yield delay(expires * 999);
		// request new token
		yield fetch('/spotify-token-refresh?token=' + escape(refreshToken))
			.then(response => response.text().then(text => ({
					json: text.length > 0 ? JSON.parse(text) : null, // only parse if present
					response
				}))
			).then(({json}) => {
				/*eslint-disable */
				// fyi linter doesn't like the camel case names
				const {access_token, expires_in, refresh_token} = json;
				accessToken = access_token;
				expires = expires_in;
				if (refresh_token) {
					// refresh token is not always supplied
					refreshToken = refresh_token;
				}
				/*eslint-enable */
			});
		yield put(spotifyAuthInit({accessToken, refreshToken, expires}));
	}
}

function * watchForDevicesRequest() {
	// wait for login
	yield take(spotifyActions.SPOTIFY_AUTH_OK);
	// request devices
	const apiResult = yield call(spotifyApiCall, {url: '/v1/me/player/devices'});
	if (apiResult && apiResult.devices) {
		yield put(spotifyDevicesUpdate(apiResult.devices));
	}
	// listen for future requests to fetch devices
	while (true) {
		yield take(spotifyActions.SPOTIFY_DEVICES_REQUEST);
		const apiResult = yield call(spotifyApiCall, {url: '/v1/me/player/devices'});
		if (apiResult && apiResult.devices) {
			yield put(spotifyDevicesUpdate(apiResult.devices));
		}
	}
}

function * watchForSwitchDevice() {
	while (true) {
		const {payload} = yield take(spotifyActions.SPOTIFY_SWITCH_DEVICE);
		yield call(spotifyApiCall, {
			url: '/v1/me/player',
			method: 'PUT',
			body: JSON.stringify({device_ids: [payload.deviceId]})
		});
		yield put(syncStart());
	}
}

function * watchForSearchRequest() {
	// wait for login
	yield take(spotifyActions.SPOTIFY_AUTH_OK);

	// listen for requests to fetch search results
	while (true) {
		const {payload: {query}} = yield take(spotifyActions.SPOTIFY_SEARCH_REQUEST);
		const apiResult = yield call(spotifyApiCall, {
			url: `/v1/search?q=${escape(query)}&type=track&limit=50`
		});
		yield put(spotifySearchUpdate({query, apiResult}));
	}
}

function * watchForSyncStop() {
	// listen for sync stopping
	while (true) {
		const {payload: {reason}} = yield take(SYNC_STOP);
		const title = 'Soundbounce deactivated';
		const options = {
			body: `${reason}`,
			silent: true,
			icon: '/favicon.ico'
		};
		if ('Notification' in window) {
			if (Notification.permission === 'granted') {
				new Notification(title, options);
			} else if (Notification.permission !== 'denied') {
				Notification.requestPermission(permission => {
					if (permission === 'granted') {
						new Notification(title, options);
					}
				});
			}
		}
	}
}

function * watchForRecommendationsRequest() {
	// wait for login
	yield take(spotifyActions.SPOTIFY_AUTH_OK);

	// listen for requests to fetch recommendations
	while (true) {
		const {payload: {trackIds, tuneableAttributes}} = yield take(spotifyActions.SPOTIFY_RECOMMENDATIONS_REQUEST);
		let query = '';
		for (let attr of tuneableAttributes) {
			if (attr.from !== attr.min || attr.to !== attr.max) {
				query += (`&min_${attr.name}=${attr.from / attr.divisor}&max_${attr.name}=${attr.to / attr.divisor}`);
			}
		}
		const apiResult = yield call(spotifyApiCall, {
			url: `/v1/recommendations?limit=100&seed_tracks=${trackIds.join(',')}${query}`
		});

		yield put(spotifyRecommendationsUpdate({tracks: apiResult.tracks}));
	}
}

function * loadMyPlaylists() {
	// wait for login
	yield take(spotifyActions.SPOTIFY_AUTH_OK);
	yield put(spotifyMyPlaylistsRequest());
	let url = '/v1/me/playlists?limit=50';
	while (url) {
		// grab playlists
		const apiResult = yield call(spotifyApiCall, {url});
		const {items} = apiResult;
		url = apiResult.next;
		if (items) {
			yield put(spotifyMyPlaylistsUpdate(items));
		}
	}
}

function * watchForAddTrackToPlaylist() {
	// listen for requests to fetch search results
	while (true) {
		const {payload: {playlistId, trackId}} = yield take(spotifyActions.SPOTIFY_ADD_TRACK_TO_PLAYLIST);
		const userId = yield select(state => state.users.currentUserId);
		yield call(spotifyApiCall, {
			url: `/v1/users/${escape(userId)}/playlists/${playlistId}/tracks`,
			method: 'POST',
			body: JSON.stringify({uris: [`spotify:track:${trackId}`], position: 0})
		});
	}
}

function * watchForAudioAnalysisRequests() {
	// wait for login
	yield take(spotifyActions.SPOTIFY_AUTH_OK);

	// listen for requests to fetch audio analysis / features
	while (true) {
		const {payload: {trackId}} = yield take(spotifyActions.SPOTIFY_AUDIO_ANALYSIS_REQUEST);
		const [audioFeatures, audioAnalysis] = yield all([
			call(spotifyApiCall, {url: `/v1/audio-features/${trackId}`}),
			call(spotifyApiCall, {url: `/v1/audio-analysis/${trackId}`})
		]);
		yield put(spotifyAudioAnalysisUpdate({trackId, audioFeatures, audioAnalysis}));
	}
}

function * handleFullAlbumRequest({albumIds, artistId}) {
	let apiResult = null;
	if (artistId) {
		// limit 20 so we can pass onto the full request later (that is max 20)
		apiResult = yield call(spotifyApiCall, {
			url: `/v1/artists/${artistId}/albums?limit=20&album_type=album` // ,single
		});
		const albumIds = apiResult.items.map(a => a.id);
		yield put(spotifyFullAlbumUpdate({
			albumIds,
			albums: apiResult.items
		}));

		if (albumIds.length > 0) {
			// now we have the crappy small objects that don't have release date,
			// they're enough to get us going, but ask api for the detail now:
			yield put(spotifyFullAlbumRequest({albumIds}));
		}
	} else {
		apiResult = yield call(spotifyApiCall, {url: `/v1/albums/?ids=${albumIds.join(',')}`});
		yield put(spotifyFullAlbumUpdate({albumIds, albums: apiResult.albums}));
	}
}

function * watchForFullAlbumRequests() {
	// wait for login
	yield take(spotifyActions.SPOTIFY_AUTH_OK);
	// listen for requests to fetch full album details
	while (true) {
		const {payload} = yield take(spotifyActions.SPOTIFY_FULL_ALBUM_REQUEST);
		// non blocking fork since we might want to do multiple album requests at once
		yield fork(handleFullAlbumRequest, payload);
	}
}

export default function * spotifyInit() {
	try {
		yield [
			watchForAuthRequired(),
			waitForAuthExpires(),
			watchForRoomNowPlayingChanged(),
			watchForDevicesRequest(),
			watchForSwitchDevice(),
			watchForPreviewTrack(),
			watchForSearchRequest(),
			beginLogin(),
			loadMyPlaylists(),
			watchForAddTrackToPlaylist(),
			watchForAudioAnalysisRequests(),
			watchForFullAlbumRequests(),
			watchForRecommendationsRequest(),
			pollSpotifyPlayerStatus(),
			watchForSyncStart(),
			watchForSyncStop()
		];
	} catch (err) {
		console.log('unhandled spotify saga error: ' + err);
		throw err;
	}
}
