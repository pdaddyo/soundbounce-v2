import {delay} from 'redux-saga';
import {take, put, select, race, call} from 'redux-saga/effects';
import {push} from 'react-router-redux';
import config from '../../../config/app';
import {actions as socketActions} from '../modules/socket';
import {syncStop, syncStartOk, syncStart} from '../modules/sync';
import {
	roomTrackProgress,
	roomNowPlayingChanged,
	roomNowPlayingEnded,
	actions as roomActions
} from '../modules/shared/room';
import moment from 'moment';
import _ from 'lodash';

function * watchForSocketRoomJoinOk() {
	while (true) {
		const {payload} = yield take(socketActions.SOCKET_ROOM_JOIN_OK);
		const {isSynced} = yield select(state => state.sync);
		if (isSynced) {
			yield put(syncStop('Joined a different room'));
		}
		const {roomId} = payload;
		// now navigate to the room
		yield put(push(`/room/${roomId}`));

		// now wait for a room full sync (i.e. full state over wire), then try to start audio
		yield take(roomActions.ROOM_FULL_SYNC);
		// don't wait for next timer to update the progress
		yield call(updateRoomTrackProgress);

		// start sync automatically on socket connect
		yield put(syncStart());

		// this call only ends when we join a differnt room, so will loop around and navigate.
		yield call(roomTrackTimerLoop);
	}
}

function * watchForSocketRoomEvent() {
	while (true) {
		const {payload} = yield take(socketActions.SOCKET_ROOM_EVENT);
		// dispatch this redux action that we received over the socket
		yield put(payload.reduxAction);
	}
}

function * pollRoomTrackProgress() {
	while (true) {
		yield call(updateRoomTrackProgress);
		yield delay(config.player.progressUpdateDelay);
	}
}

function * updateRoomTrackProgress() {
	const {room, sync} = yield select(state => state);
	if (room.playlist.length > 0) {
		const nowPlayingProgress = moment().valueOf() - room.nowPlayingStartedAt - sync.serverMsOffset;
		yield put(roomTrackProgress({nowPlayingProgress}));
	}
}

function * roomTrackTimerLoop() {
	while (true) {
		let {room, sync, spotify} = yield select(state => state);

		if (room.playlist.length === 0) {
			// no tracks, we're done
			if (sync.isSynced) {
				yield put(syncStop());
			}

			// wait for either action that can make music appear
			yield race({
				fullSync: take(roomActions.ROOM_FULL_SYNC),
				addOrVote: take(roomActions.ROOM_TRACK_ADD_OR_VOTE)
			});
			// loop around
			continue;
		}

		const trackWithVotes = room.playlist[0];
		const seekPosition = moment().valueOf() - room.nowPlayingStartedAt - sync.serverMsOffset;

		yield put(roomNowPlayingChanged({
			trackIds: _.take(room.playlist, config.player.maxTracksToQueueWhenPlaying).map(t => t.id),
			seekPosition
		}));

		if (sync.isSyncing) {
			yield put(syncStartOk());
		}

		// ok now race a timer to the end of this track vs sync stopping for any reason
		const {leftRoom} = yield race({
			delay: delay(spotify.tracks[trackWithVotes.id].duration - seekPosition),
			leftRoom: take(roomActions.ROOM_NAVIGATING)
		});

		// sync stopped, bail
		if (leftRoom) {
			return;
		}

		// reselect the state because it might have changed whilst track was playing
		// e.g. new spotify track when we look up duration below
		let state = yield select(state => state);
		room = state.room;

		const finishingTrackDuration = state.spotify.tracks[room.playlist[0].id].duration;

		// ok let's fire a next track action!
		yield put(roomNowPlayingEnded({trackWithVotes, finishingTrackDuration}));
	}
}

export default function * socketInit() {
	try {
		yield [
			watchForSocketRoomJoinOk(),
			watchForSocketRoomEvent(),
			pollRoomTrackProgress()
		];
	} catch (err) {
		console.log('unhandled room saga error: ' + err);
	}
}
