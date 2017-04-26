import {take, put} from 'redux-saga/effects';
// import {actions as roomActions} from '../modules/shared/room';
import {actions as socketActions} from '../modules/socket';
import {push} from 'react-router-redux';

function * watchForSocketRoomJoinOk() {
	while (true) {
		const {payload} = yield take(socketActions.SOCKET_ROOM_JOIN_OK);
		const {roomId} = payload;
		// now navigate to the room
		yield put(push(`/room/${roomId}`));
	}
}

export default function * socketInit() {
	try {
		yield [
			watchForSocketRoomJoinOk()
		];
	} catch (err) {
		console.log('unhandled room saga error: ' + err);
	}
}
