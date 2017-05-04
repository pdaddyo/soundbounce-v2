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
	isSyncing: false,
	lastSyncError: null,
	serverMsOffset: 0
};

// ------------------------------------
// Action Creators
// ------------------------------------
export const syncSetServerOffset = ({ticks}) => ({
	type: SYNC_SET_SERVER_OFFSET,
	payload: {ticks}
});

export const syncStart = () => ({
	type: SYNC_START
});

export const syncStartFail = ({error}) => ({
	type: SYNC_START_FAIL,
	payload: {error}
});

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[SYNC_SET_SERVER_OFFSET]: (state, {payload}) => ({
		...state,
		serverMsOffset: payload.ticks
	}),
	[SYNC_START]: (state) => {
		if (state.isSynced) {
			// don't do anything if we're already synced
			return state;
		}
		return {
			...state,
			isSyncing: true,
			lastSyncError: null
		};
	},
	[SYNC_START_OK]: (state) => ({
		...state,
		isSyncing: false,
		isSynced: true
	}),
	[SYNC_START_FAIL]: (state, {payload}) => ({
		...state,
		isSyncing: false,
		isSynced: true,
		lastSyncError: payload.error
	}),
	[SYNC_PLAYER_DEVIATED]: (state, {payload}) => ({
		...state,
		isSyncing: false,
		isSynced: false,
		lastSyncError: `Sync stopped: ${payload.reason}`
	}),
	[SYNC_STOP]: (state, {payload}) => ({
		...state,
		isSyncing: false,
		isSynced: false
	})
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function syncReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
