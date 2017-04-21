import io from 'socket.io-client';
// import {delay} from 'redux-saga';
import {take} from 'redux-saga/effects';
import {actions as socketActions} from '../modules/socket';

let socket = null;

function * watchForSocketConnectBegin() {
	while (true) {
		yield take(socketActions.SOCKET_CONNECT_BEGIN);
		socket = io.connect('/');
	}
}

function * watchForSocketEmitRoomCreate() {
	while (true) {
		const {payload} = yield take(socketActions.SOCKET_EMIT_ROOM_CREATE);
		if (!socket) {
			// wait for the socket if it's not ready
			yield take(socketActions.SOCKET_CONNECT_OK);
		}

		socket.emit('room:create', payload.room);
	}
}

export default function * socketInit() {
	try {
		yield [
			watchForSocketConnectBegin(),
			watchForSocketEmitRoomCreate()
		];
	} catch (err) {
		console.log('unhandled socket saga error: ' + err);
	}
}
