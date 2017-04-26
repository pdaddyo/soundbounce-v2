// This redux module is shared between client and server,
// so the same messages (shared via socket.io) can keep state in sync

// ------------------------------------
// Constants
// ------------------------------------
export const ROOM_FULL_SYNC = 'ROOM_FULL_SYNC';
export const ROOM_NOW_PLAYING_ENDED = 'ROOM_NOW_PLAYING_ENDED';
export const ROOM_TRACK_ADD_OR_VOTE = 'ROOM_TRACK_ADD_OR_VOTE';
export const ROOM_TRACK_LIKE = 'ROOM_TRACK_LIKE';
export const ROOM_CHAT = 'ROOM_CHAT';

export const actions = {
	ROOM_FULL_SYNC,
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
export const roomFullSync = (fullSync) => ({
	type: ROOM_FULL_SYNC,
	payload: {fullSync}
});

export const roomTrackAddOrVote = ({who, trackIds}) => ({
	type: ROOM_TRACK_ADD_OR_VOTE,
	payload: {who, trackIds}
});

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[ROOM_FULL_SYNC]: (state, {payload}) => ({
		...payload.fullSync.room
	})
};

// ------------------------------------
// Reducer
// ------------------------------------

export default function roomReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
