import {take, select, put} from 'redux-saga/effects';
import {actions as socketActions} from '../modules/socket';
import {setCurrentUser} from '../modules/users';
import socketClient from '../../socketClient/client';

function * watchForSocketConnectBegin() {
	while (true) {
		yield take(socketActions.SOCKET_CONNECT_BEGIN);
		socketClient.connect();
	}
}

function * watchForSocketConnectOk() {
	while (true) {
		yield take(socketActions.SOCKET_CONNECT_OK);
		const {accessToken} = yield select(state => state.spotify);
		socketClient.emit('user:auth', {accessToken});
	}
}

function * watchForSocketAuthOk() {
	while (true) {
		const {payload} = yield take(socketActions.SOCKET_AUTH_OK);
		yield put(setCurrentUser(payload.user));
	}
}

function * watchForSocketEmitRoomCreate() {
	while (true) {
		if (!socketClient.socket) {
			// wait for the socket if it's not ready
			yield take(socketActions.SOCKET_CONNECT_OK);
		}
		const {payload} = yield take(socketActions.SOCKET_EMIT_ROOM_CREATE);
		socketClient.emit('room:create', payload.room);
	}
}

function * watchForSocketOnRoomCreateOk() {
	while (true) {
		const {payload} = yield take(socketActions.SOCKET_ROOM_CREATE_OK);
		console.log('room created on server: ', payload.room);
	}
}

export default function * socketInit() {
	try {
		yield [
			watchForSocketConnectBegin(),
			watchForSocketConnectOk(),
			watchForSocketAuthOk(),
			watchForSocketEmitRoomCreate(),
			watchForSocketOnRoomCreateOk()
		];
	} catch (err) {
		console.log('unhandled socket saga error: ' + err);
	}
}
