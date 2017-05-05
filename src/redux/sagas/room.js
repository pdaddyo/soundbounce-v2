import {delay} from 'redux-saga';
import {take, put, select} from 'redux-saga/effects';
import {push} from 'react-router-redux';
import config from '../../../config/app';
import {actions as socketActions} from '../modules/socket';
import {roomTrackProgress, actions as roomActions} from '../modules/shared/room';
import {syncStart} from '../modules/sync';
import moment from 'moment';

function * watchForSocketRoomJoinOk() {
	while (true) {
		const {payload} = yield take(socketActions.SOCKET_ROOM_JOIN_OK);
		const {roomId} = payload;
		// now navigate to the room
		yield put(push(`/room/${roomId}`));

		// now wait for a room full sync (i.e. full state over wire), then try to start audio
		yield take(roomActions.ROOM_FULL_SYNC);
		yield put(syncStart());
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
		const {room, sync} = yield select(state => state);
		if (room.playlist.length > 0) {
			const nowPlayingProgress = moment().valueOf() - room.nowPlayingStartedAt - sync.serverMsOffset;
			yield put(roomTrackProgress({nowPlayingProgress}));
		}
		yield delay(config.player.progressUpdateDelay);
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
