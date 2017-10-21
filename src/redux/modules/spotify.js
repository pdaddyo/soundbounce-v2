import update from 'react-addons-update';

import {ROOM_FULL_SYNC} from './shared/room';
import {SOCKET_ROOM_EVENT, SOCKET_HOME_DATA_OK} from './socket';

// ------------------------------------
// Constants
// ------------------------------------
export const SPOTIFY_AUTH_REQUIRED = 'SPOTIFY_AUTH_REQUIRED';
export const SPOTIFY_AUTH_INIT = 'SPOTIFY_AUTH_INIT';
export const SPOTIFY_AUTH_OK = 'SPOTIFY_AUTH_OK';
export const SPOTIFY_API_REQUEST_START = 'SPOTIFY_API_REQUEST_START';
export const SPOTIFY_API_REQUEST_OK = 'SPOTIFY_API_REQUEST_OK';
export const SPOTIFY_API_REQUEST_RETRY = 'SPOTIFY_API_REQUEST_RETRY';
export const SPOTIFY_API_REQUEST_ERROR = 'SPOTIFY_API_REQUEST_ERROR';
export const SPOTIFY_PROFILE_REQUEST = 'SPOTIFY_PROFILE_REQUEST';
export const SPOTIFY_PLAYER_STATE_REQUEST = 'SPOTIFY_PLAYER_STATE_REQUEST';
export const SPOTIFY_PLAYER_STATE_UPDATE = 'SPOTIFY_PLAYER_STATE_UPDATE';
export const SPOTIFY_DEVICES_REQUEST = 'SPOTIFY_DEVICES_REQUEST';
export const SPOTIFY_DEVICES_UPDATE = 'SPOTIFY_DEVICES_UPDATE';
export const SPOTIFY_SEARCH_REQUEST = 'SPOTIFY_SEARCH_REQUEST';
export const SPOTIFY_SEARCH_UPDATE = 'SPOTIFY_SEARCH_UPDATE';
export const SPOTIFY_PLAY_TRACK = 'SPOTIFY_PLAY_TRACK';
export const SPOTIFY_PREVIEW_TRACK = 'SPOTIFY_PREVIEW_TRACK';
export const SPOTIFY_SWITCH_DEVICE = 'SPOTIFY_SWITCH_DEVICE';
export const SPOTIFY_DISABLE_SHUFFLE = 'SPOTIFY_DISABLE_SHUFFLE';
export const SPOTIFY_MY_PLAYLISTS_REQUEST = 'SPOTIFY_MY_PLAYLISTS_REQUEST';
export const SPOTIFY_MY_PLAYLISTS_UPDATE = 'SPOTIFY_MY_PLAYLISTS_UPDATE';
export const SPOTIFY_ADD_TRACK_TO_PLAYLIST = 'SPOTIFY_ADD_TRACK_TO_PLAYLIST';
export const SPOTIFY_AUDIO_ANALYSIS_REQUEST = 'SPOTIFY_AUDIO_ANALYSIS_REQUEST';
export const SPOTIFY_AUDIO_ANALYSIS_UPDATE = 'SPOTIFY_AUDIO_ANALYSIS_UPDATE';

export const actions = {
	SPOTIFY_AUTH_REQUIRED,
	SPOTIFY_AUTH_INIT,
	SPOTIFY_AUTH_OK,
	SPOTIFY_API_REQUEST_START,
	SPOTIFY_API_REQUEST_OK,
	SPOTIFY_API_REQUEST_RETRY,
	SPOTIFY_API_REQUEST_ERROR,
	SPOTIFY_PROFILE_REQUEST,
	SPOTIFY_DEVICES_REQUEST,
	SPOTIFY_DEVICES_UPDATE,
	SPOTIFY_SEARCH_REQUEST,
	SPOTIFY_SEARCH_UPDATE,
	SPOTIFY_PLAYER_STATE_REQUEST,
	SPOTIFY_PLAYER_STATE_UPDATE,
	SPOTIFY_PLAY_TRACK,
	SPOTIFY_PREVIEW_TRACK,
	SPOTIFY_SWITCH_DEVICE,
	SPOTIFY_DISABLE_SHUFFLE,
	SPOTIFY_MY_PLAYLISTS_REQUEST,
	SPOTIFY_MY_PLAYLISTS_UPDATE,
	SPOTIFY_ADD_TRACK_TO_PLAYLIST,
	SPOTIFY_AUDIO_ANALYSIS_REQUEST,
	SPOTIFY_AUDIO_ANALYSIS_UPDATE
};

// ------------------------------------
// Default spotify state
// ------------------------------------
const defaultState = {
	isFetching: false,
	accessToken: null,
	refreshToken: null,
	isLoggedIn: false,
	player: {},
	devices: [],
	searchResults: {}, // {query, apiResult}
	myPlaylists: [],
	audioAnalysis: {}, // stored by track id
	audioFeatures: {}, // stored by track id
	tracks: {}  // tracks stored by key object key 'id'
};

// ------------------------------------
// Action Creators
// ------------------------------------
export const spotifyAuthRequired = () => ({
	type: SPOTIFY_AUTH_REQUIRED
});

export const spotifyAuthInit = ({accessToken, refreshToken, expires}) => ({
	type: SPOTIFY_AUTH_INIT,
	payload: {accessToken, refreshToken, expires}
});

export const spotifyAuthOK = (profile) => ({
	type: SPOTIFY_AUTH_OK,
	payload: {profile}
});

export const spotifyProfileRequest = () => ({
	type: SPOTIFY_PROFILE_REQUEST
});

export const spotifyPlayerStateRequest = () => ({
	type: SPOTIFY_PLAYER_STATE_REQUEST
});

export const spotifyPlayerStateUpdate = (playerState) => ({
	type: SPOTIFY_PLAYER_STATE_UPDATE,
	payload: {playerState}
});

export const spotifyDevicesRequest = () => ({
	type: SPOTIFY_DEVICES_REQUEST
});

export const spotifyDevicesUpdate = (devices) => ({
	type: SPOTIFY_DEVICES_UPDATE,
	payload: {devices}
});

export const spotifySearchRequest = (query) => ({
	type: SPOTIFY_SEARCH_REQUEST,
	payload: {query}
});

export const spotifySearchUpdate = ({query, apiResult}) => ({
	type: SPOTIFY_SEARCH_UPDATE,
	payload: {query, apiResult}
});

export const spotifyPlayTrack = ({trackId, offset}) => ({
	type: SPOTIFY_PLAY_TRACK,
	payload: {trackId, offset}
});

export const spotifyPreviewTrack = (trackId, offset = 0) => ({
	type: SPOTIFY_PREVIEW_TRACK,
	payload: {trackId, offset}
});

export const spotifyDisableShuffle = () => ({
	type: SPOTIFY_DISABLE_SHUFFLE
});

export const spotifySwitchDevice = (deviceId) => ({
	type: SPOTIFY_SWITCH_DEVICE,
	payload: {deviceId}
});

export const spotifyMyPlaylistsRequest = (options) => ({
	type: SPOTIFY_MY_PLAYLISTS_REQUEST,
	payload: options
});

export const spotifyMyPlaylistsUpdate = (playlists) => ({
	type: SPOTIFY_MY_PLAYLISTS_UPDATE,
	payload: {playlists}
});

export const spotifyAddTrackToPlaylist = ({playlistId, trackId}) => ({
	type: SPOTIFY_ADD_TRACK_TO_PLAYLIST,
	payload: {playlistId, trackId}
});

export const spotifyAudioAnalysisRequest = (trackId) => ({
	type: SPOTIFY_AUDIO_ANALYSIS_REQUEST,
	payload: {trackId}
});

export const spotifyAudioAnalysisUpdate = ({trackId, audioFeatures, audioAnalysis}) => ({
	type: SPOTIFY_AUDIO_ANALYSIS_UPDATE,
	payload: {trackId, audioFeatures, audioAnalysis}
});

// ------------------------------------
// Action Handlers
// ------------------------------------
const mergeTracks = ({state, tracks}) => {
	let existingTracks = state.tracks;
	const updateCommand = {};
	// don't want to overwrite tracks if already have more info
	for (let track of tracks) {
		if (existingTracks[track.id]) {
			track = {...existingTracks[track.id], ...track};
		}
		updateCommand[track.id] = {$set: track};
	}
	return {
		...state,
		tracks: update(state.tracks, updateCommand)
	};
};

const ACTION_HANDLERS = {
		[SPOTIFY_AUTH_INIT]: (state, {payload}) => ({
			...state,
			accessToken: payload.accessToken,
			refreshToken: payload.refreshToken
		}),
		[SPOTIFY_AUTH_OK]: (state, {payload}) => ({
			...state,
			isLoggedIn: true
		}),
		[SPOTIFY_PLAYER_STATE_UPDATE]: (state, {payload}) => {
			const {item} = payload.playerState;
			const newState = {
				...state,
				player: payload.playerState
			};

			// this might be a new track that we haven't seen before, check if it's in our
			// track state already
			if (item && item.type !== 'track') {
				// we're only set up to deal with spotify playing tracks
				throw new Error(`Unexpected spotify player item type (${item.type})`);
			}

			if (!state.tracks[item.id]) {
				// add track to state
				newState.tracks = update(state.tracks, {[item.id]: {$set: item}});
			} else {
				// update existing info with our info (we may have requested more details already, so
				// don't want to overwrite the existing track.
				newState.tracks[item.id] = {...newState.tracks[item.id], ...item};
			}
			return newState;
		},
		[SPOTIFY_DEVICES_UPDATE]: (state, {payload}) => ({
			...state,
			devices: payload.devices
		}),
		[SPOTIFY_SEARCH_UPDATE]: (state, {payload}) => {
			// merge any track data from search results
			const {query, apiResult} = payload;
			if (!apiResult) {
				return state;
			}
			const {tracks} = apiResult;
			const newState = {
				...state,
				searchResults: {...state.searchResults, [query]: apiResult}
			};

			if (tracks && tracks.items) {
				return mergeTracks({state: newState, tracks: tracks.items});
			}
			return newState;
		},
		[SPOTIFY_AUDIO_ANALYSIS_UPDATE]: (state, {payload}) => {
			const {trackId, audioAnalysis, audioFeatures} = payload;
			return {
				...state,
				audioAnalysis: {...state.audioAnalysis, [trackId]: audioAnalysis},
				audioFeatures: {...state.audioFeatures, [trackId]: audioFeatures}
			};
		},
		[SPOTIFY_MY_PLAYLISTS_UPDATE]: (state, {payload: {playlists}}) => (
			{
				...state,
				myPlaylists: [...state.myPlaylists, ...playlists]
			}
		),
		[ROOM_FULL_SYNC]: (state, {payload}) => {
			// merge any track data from room sync
			return mergeTracks({state, tracks: payload.fullSync.tracks});
		},
		[SOCKET_HOME_DATA_OK]: (state, {payload}) => {
			// merge any track data from room sync
			return mergeTracks({state, tracks: payload.home.tracks});
		},
		[SOCKET_ROOM_EVENT]: (state, {payload}) => {
			// merge any track data from adds / votes if present
			if (payload.tracks) {
				return mergeTracks({state, tracks: payload.tracks});
			}
			return state;
		}
	}
;

// ------------------------------------
// Reducer
// ------------------------------------

export default function spotifyReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
