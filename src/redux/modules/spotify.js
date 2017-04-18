// ------------------------------------
// Constants
// ------------------------------------
export const SPOTIFY_AUTH_INIT = 'SPOTIFY_AUTH_INIT';

const defaultSpotifyState = {
	isFetching: false,
	accessToken: null,
	refreshToken: null,
	isLoggedIn: false
};

export const authInit = ({accessToken, refreshToken}) => ({
	type: SPOTIFY_AUTH_INIT,
	accessToken,
	refreshToken
});

export const actions = {
	authInit
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[SPOTIFY_AUTH_INIT]: (state, {accessToken, refreshToken}) => ({
		...state,
		accessToken,
		refreshToken
	})
};

// ------------------------------------
// Reducer
// ------------------------------------

export default function currentUserReducer(state = defaultSpotifyState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
