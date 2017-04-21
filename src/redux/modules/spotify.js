// ------------------------------------
// Constants
// ------------------------------------
export const SPOTIFY_AUTH_INIT = 'SPOTIFY_AUTH_INIT';
export const SPOTIFY_AUTH_OK = 'SPOTIFY_AUTH_OK';
export const SPOTIFY_API_REQUEST_START = 'SPOTIFY_API_REQUEST_START';
export const SPOTIFY_API_REQUEST_OK = 'SPOTIFY_API_REQUEST_OK';
export const SPOTIFY_API_REQUEST_ERROR = 'SPOTIFY_API_REQUEST_ERROR';
export const SPOTIFY_PLAYER_STATE_UPDATE = 'SPOTIFY_PLAYER_STATE_UPDATE';

export const actions = {
	SPOTIFY_AUTH_INIT,
	SPOTIFY_AUTH_OK,
	SPOTIFY_API_REQUEST_START,
	SPOTIFY_API_REQUEST_OK,
	SPOTIFY_API_REQUEST_ERROR,
	SPOTIFY_PLAYER_STATE_UPDATE
};

// ------------------------------------
// Default state
// ------------------------------------
const defaultState = {
	isFetching: false,
	accessToken: null,
	refreshToken: null,
	isLoggedIn: false,
	player: null,
	profile: null
};

// ------------------------------------
// Action Creators
// ------------------------------------
export const spotifyAuthInit = ({accessToken, refreshToken}) => ({
	type: SPOTIFY_AUTH_INIT,
	payload: {accessToken, refreshToken}
});

export const spotifyAuthOK = (profile) => ({
	type: SPOTIFY_AUTH_OK,
	payload: {profile}
});

export const spotifyPlayerStateUpdate = (playerState) => ({
	type: SPOTIFY_PLAYER_STATE_UPDATE,
	payload: {playerState}
});

export const actionCreators = {
	spotifyAuthInit,
	spotifyAuthOK,
	spotifyPlayerStateUpdate
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[SPOTIFY_AUTH_INIT]: (state, {payload}) => ({
		...state,
		accessToken: payload.accessToken,
		refreshToken: payload.refreshToken
	}),
	[SPOTIFY_AUTH_OK]: (state, {payload}) => ({
		...state,
		profile: payload.profile,
		isLoggedIn: true
	}),
	[SPOTIFY_PLAYER_STATE_UPDATE]: (state, {payload}) => ({
		...state,
		player: payload.playerState
	})
};

// ------------------------------------
// Reducer
// ------------------------------------

export default function spotifyReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
