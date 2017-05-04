import {take, put} from 'redux-saga/effects';
import {push} from 'react-router-redux';
import {actions as socketActions} from '../modules/socket';
import {actions as roomActions} from '../modules/shared/room';
import {syncStart} from '../modules/sync';

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

export default function * socketInit() {
	try {
		yield [
			watchForSocketRoomJoinOk(),
			watchForSocketRoomEvent()
		];
	} catch (err) {
		console.log('unhandled room saga error: ' + err);
	}
}
