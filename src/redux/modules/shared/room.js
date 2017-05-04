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

const applyVotes = ({playlist, payload}) => {
	const {userId, trackIds, reason, emote} = payload;
	/*
	 The playlist is an array of track ids with votes, like so:
	 [{id, votes: [{userId, emote, reason}]},...]
	 */
	let updatedPlaylist = playlist;
	for (let trackId of trackIds) {
		let playlistTrack = updatedPlaylist.find(t => t.id === trackId);
		if (!playlistTrack) {
			playlistTrack = {id: trackId, votes: []};
		} else {
			const oldIndex = updatedPlaylist.indexOf(playlistTrack);

			// can't vote for the now playing track
			if (oldIndex === 0) {
				continue;
			}

			// track was already in list - check they haven't already voted for it
			if (playlistTrack.votes.find(v => v.userId === userId)) {
				// user has already voted, neeeext!
				continue;
			}
			// remove the existing track from the playlist
			updatedPlaylist = update(updatedPlaylist, {$splice: [[oldIndex, 1]]});
		}

		// add the vote to the track
		const newPlaylistTrack = update(playlistTrack, {
			votes: {$push: [{userId, emote, reason}]}
		});

		// if this is the only track or first track, just return it as only item
		if (updatedPlaylist.length === 0) {
			updatedPlaylist = [newPlaylistTrack];
			continue;
		}

		if (updatedPlaylist.length === 1) {
			// there is a track playing which we shouldn't touch
			updatedPlaylist = [updatedPlaylist[0], newPlaylistTrack];
			continue;
		}

		// start from the bottom of the playlist, stopping before a track with our
		// vote count
		let playlistIndex = updatedPlaylist.length;
		while (playlistIndex > 1) {
			if (updatedPlaylist[playlistIndex - 1].votes.length >= newPlaylistTrack.votes.length) {
				break;
			}
			playlistIndex--;
		}
		// insert at the new spot
		updatedPlaylist = update(updatedPlaylist, {$splice: [[playlistIndex, 0, newPlaylistTrack]]});
	}

	return updatedPlaylist;
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
		const {actionLog, playlist} = state;
		const {payload} = action;
		return {
			...state,
			playlist: applyVotes({playlist, payload}),
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
