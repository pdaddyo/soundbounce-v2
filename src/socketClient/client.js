/*
 Socket.io / socket redux go-between
 */

import io from 'socket.io-client';
import {
	socketRoomCreateOk,
	socketConnectOk,
	socketConnectError,
	socketAuthOk,
	socketRoomJoinRequest
} from 'redux/modules/socket';

class SocketClient {
	setStore(store) {
		this.store = store;
	}

	connect() {
		const {dispatch} = this.store;
		this.socket = io.connect('/');
		this.socket.on('connect', () => {
			dispatch(socketConnectOk());
		});
		this.socket.on('connect_error', (error) => {
			dispatch(socketConnectError(error.message || 'Socket connect error'));
		});
		this.setupMessageHandlers();
	}

	disconnect() {
		if (!this.socket) {
			return;
		}
		this.socket.close();
	}

	setupMessageHandlers() {
		const {socket} = this;
		const {dispatch} = this.store;
		socket.on('user:auth:ok', (user) => {
			dispatch(socketAuthOk(user));
		});
		socket.on('room:create:ok', (room) => {
			dispatch(socketRoomCreateOk(room));
		});
		socket.on('room:join:request', (roomId) => {
			dispatch(socketRoomJoinRequest(roomId));
			socket.emit('room:join', roomId);
		});
		socket.on('room:join:ok', (room) => {
			//todo: handle room join
			console.log('room join ok!');
		});
	}

	emit(eventName, param) {
		//	console.log(`emit [${eventName}] -->`, param);
		this.socket.emit(eventName, param);
	}
}

export default new SocketClient();
