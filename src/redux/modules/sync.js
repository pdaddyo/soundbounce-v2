// import update from 'react-addons-update';
// ------------------------------------
// Constants
// ------------------------------------
export const SYNC_SET_SERVER_OFFSET = 'SYNC_SET_SERVER_OFFSET';
export const SYNC_START = 'SYNC_START';
export const SYNC_START_OK = 'SYNC_START_OK';
export const SYNC_START_FAIL = 'SYNC_START_FAIL';
export const SYNC_PLAYER_DEVIATED = 'SYNC_PLAYER_DEVIATED';
export const SYNC_STOP = 'SYNC_STOP';

export const actions = {
	SYNC_SET_SERVER_OFFSET,
	SYNC_START,
	SYNC_START_OK,
	SYNC_START_FAIL,
	SYNC_PLAYER_DEVIATED,
	SYNC_STOP
};

// ------------------------------------
// Default state
// ------------------------------------
const defaultState = {
	isSynced: false,
	lastSyncError: null,
	serverTickOffset: 0
};

// ------------------------------------
// Action Creators
// ------------------------------------
export const syncSetServerOffset = ({ticks}) => ({
	type: SYNC_SET_SERVER_OFFSET,
	payload: {ticks}
});

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[SYNC_SET_SERVER_OFFSET]: (state, {payload}) => ({
		...state,
		serverTickOffset: payload.ticks
	})
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function syncReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
