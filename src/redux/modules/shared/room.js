// This redux module is shared between client and server,
// so the same messages (shared via socket.io) can keep state in sync
import update from 'react-addons-update';

// ------------------------------------
// Constants
// ------------------------------------
export const ROOM_FULL_SYNC = 'ROOM_FULL_SYNC';
export const ROOM_USER_JOIN = 'ROOM_USER_JOIN';
export const ROOM_USER_LEAVE = 'ROOM_USER_LEAVE';
export const ROOM_NOW_PLAYING_ENDED = 'ROOM_NOW_PLAYING_ENDED';
export const ROOM_TRACK_ADD_OR_VOTE = 'ROOM_TRACK_ADD_OR_VOTE';
export const ROOM_TRACK_LIKE = 'ROOM_TRACK_LIKE';
export const ROOM_CHAT = 'ROOM_CHAT';

export const actions = {
	ROOM_FULL_SYNC,
	ROOM_USER_JOIN,
	ROOM_USER_LEAVE,
	ROOM_NOW_PLAYING_ENDED,
	ROOM_TRACK_ADD_OR_VOTE,
	ROOM_TRACK_LIKE,
	ROOM_CHAT
};

// ------------------------------------
// Default state
// ------------------------------------
const defaultState = {
	id: null,
	name: '????',
	config: {},
	actionLog: [],
	listeners: []
};

// ------------------------------------
// Action Creators
// ------------------------------------
export const roomFullSync = (fullSync) => ({
	type: ROOM_FULL_SYNC,
	payload: {fullSync}
});

export const roomUserJoin = (userId) => ({
	type: ROOM_USER_JOIN,
	payload: {userId}
});

export const roomUserLeave = (userId) => ({
	type: ROOM_USER_LEAVE,
	payload: {userId}
});

export const roomTrackAddOrVote = ({userId, trackIds, reason = 'added from Spotify'}) => ({
	type: ROOM_TRACK_ADD_OR_VOTE,
	payload: {userId, trackIds, reason}
});

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[ROOM_FULL_SYNC]: (state, {payload}) => ({
		/*
		 flatten out any db fields like name and id into the reduxState so we don't have
		 nested state object.  this could probably be refactored to be easier to understand, but means
		 the client sees a single room object, but the database has reduxState separated.
		 */
		...state,
		...payload.fullSync.room.reduxState,
		listeners: payload.fullSync.room.listeners,
		name: payload.fullSync.room.name,
		id: payload.fullSync.room.id,
		config: payload.fullSync.room.config
	}),
	[ROOM_USER_JOIN]: (state, {payload}) => {
		const {userId} = payload;
		if (state.listeners.indexOf(userId) === -1) {
			return {
				...state,
				listeners: update(state.listeners, {$push: [userId]}),
				actionLog: update(state.actionLog, {
					$push: [{
						type: ROOM_USER_JOIN,
						payload
					}]
				})
			};
		}
		return state;
	},
	[ROOM_USER_LEAVE]: (state, {payload}) => {
		const {userId} = payload;
		const arrayIndex = state.listeners.indexOf(userId);
		if (arrayIndex > -1) {
			return {
				...state,
				listeners: update(state.listeners, {$splice: [[arrayIndex, 1]]}),
				actionLog: update(state.actionLog, {
					$push: [{
						type: ROOM_USER_LEAVE,
						payload
					}]
				})
			};
		}
		return state;
	}
};
// ------------------------------------
// Reducer
// ------------------------------------

export default function roomReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
