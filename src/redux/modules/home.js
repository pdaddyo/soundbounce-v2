// ------------------------------------
// Constants
// ------------------------------------
export const HOME_SET_DATA = 'HOME_SET_DATA';

export const actions = {
	HOME_SET_DATA
};

// ------------------------------------
// Default state
// ------------------------------------
const defaultState = {
	activeRooms: []
};

// ------------------------------------
// Action Creators
// ------------------------------------
export const homeSetData = (home) => ({
	type: HOME_SET_DATA,
	payload: {home}
});

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[HOME_SET_DATA]: (state, {payload}) => (payload.home)
};

// ------------------------------------
// Reducer
// ------------------------------------

export default function homeReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
