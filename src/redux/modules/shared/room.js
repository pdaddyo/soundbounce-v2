// This redux module is shared between client and server,
// so the same messages (shared via socket.io) can keep state in sync

// ------------------------------------
// Constants
// ------------------------------------
export const ROOM_SET_FULL_STATE = 'ROOM_SET_FULL_STATE';
export const ROOM_NOW_PLAYING_ENDED = 'ROOM_NOW_PLAYING_ENDED';
export const ROOM_TRACK_ADD_OR_VOTE = 'ROOM_TRACK_ADD_OR_VOTE';
export const ROOM_TRACK_LIKE = 'ROOM_TRACK_LIKE';
export const ROOM_CHAT = 'ROOM_CHAT';

export const actions = {
	ROOM_SET_FULL_STATE,
	ROOM_NOW_PLAYING_ENDED,
	ROOM_TRACK_ADD_OR_VOTE,
	ROOM_TRACK_LIKE,
	ROOM_CHAT
};

// ------------------------------------
// Default state
// ------------------------------------
const defaultState = {
	playlist: [],
	events: []
};

// ------------------------------------
// Action Creators
// ------------------------------------
export const roomSetFullState = (state) => ({
	type: ROOM_SET_FULL_STATE,
	payload: {state}
});

export const roomTrackAddOrVote = ({who, trackIds}) => ({
	type: ROOM_TRACK_ADD_OR_VOTE,
	payload: {who, trackIds}
});

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[ROOM_SET_FULL_STATE]: (state, {payload}) => ({
		...payload.state
	})
};

// ------------------------------------
// Reducer
// ------------------------------------

export default function roomReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
