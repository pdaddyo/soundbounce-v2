// This redux module is shared between client and server,
// so the same messages (shared via socket.io) can keep state in sync
import update from 'react-addons-update';
import config from '../../../../config/server';
import {orderBy, take} from 'lodash';

// ------------------------------------
// Constants
// ------------------------------------
export const ROOM_FULL_SYNC = 'ROOM_FULL_SYNC';
export const ROOM_USER_JOIN = 'ROOM_USER_JOIN';
export const ROOM_USER_LEAVE = 'ROOM_USER_LEAVE';
export const ROOM_NOW_PLAYING_ENDED = 'ROOM_NOW_PLAYING_ENDED';
export const ROOM_TRACK_ADD_OR_VOTE = 'ROOM_TRACKS_ADD_OR_VOTE';
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
	listeners: [],
	playlist: [],
	recentlyPlayed: [],
	nowPlayingStartedAt: null
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

export const roomTrackAddOrVote = ({userId, trackIds, reason = 'Added manually by user', emote = ''}) => ({
	type: ROOM_TRACK_ADD_OR_VOTE,
	payload: {userId, trackIds, reason}
});

export const roomChat = ({userId, text}) => ({
	type: ROOM_CHAT,
	payload: {userId, text}
});

// ------------------------------------
// Action Handlers
// ------------------------------------
const appendToActionLog = ({actionLog, action}) => {
	if (actionLog.length >= config.actionLogMaxLength) {
		// remove old messages if at limit
		return update(take(
			orderBy(actionLog, ['timestamp'], ['desc']),
			config.actionLogMaxLength - 1), {
			$push: [action]
		});
	}

	return update(actionLog, {
		$push: [action]
	});
};

const ACTION_HANDLERS = {
	[ROOM_FULL_SYNC]: (state, {payload}) => ({
		/*
		 flatten out any db fields like name and id into the reduxState so we don't have
		 nested state object (like we do in the db).
		 this could probably be refactored to be easier to understand, but means
		 the client sees a single room object, but the database has reduxState separated.
		 */
		...state,
		...payload.fullSync.room.reduxState,
		listeners: payload.fullSync.room.listeners,
		name: payload.fullSync.room.name,
		id: payload.fullSync.room.id,
		config: payload.fullSync.room.config
	}),
	[ROOM_USER_JOIN]: (state, action) => {
		const {userId} = action.payload;
		const {listeners, actionLog} = state;
		if (listeners.indexOf(userId) === -1) {
			return {
				...state,
				listeners: update(listeners, {$push: [userId]}),
				actionLog: appendToActionLog({actionLog, action})
			};
		}
		return state;
	},
	[ROOM_USER_LEAVE]: (state, action) => {
		const {userId} = action.payload;
		const {listeners, actionLog} = state;
		const arrayIndex = listeners.indexOf(userId);
		if (arrayIndex > -1) {
			return {
				...state,
				listeners: update(listeners, {$splice: [[arrayIndex, 1]]}),
				actionLog: appendToActionLog({actionLog, action})
			};
		}
		return state;
	},
	[ROOM_CHAT]: (state, action) => ({
		...state,
		actionLog: appendToActionLog({actionLog: state.actionLog, action})
	}),
	[ROOM_TRACK_ADD_OR_VOTE]: (state, action) => {
		const {userId, trackIds, reason, emote} = action.payload;
		const {actionLog} = state;
		return {
			...state,
			/* todo: update playlist properly instead of overwriting it! */
			playlist: trackIds.map(id => ({id, votes: [{userId, emote, reason}]})),
			actionLog: appendToActionLog({actionLog, action})
		};
	}
};
// ------------------------------------
// Reducer
// ------------------------------------

export default function roomReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
