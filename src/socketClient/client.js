/*
 Socket.io / socket redux go-between
 */

import io from 'socket.io-client';
import {
	socketRoomCreateOk,
	socketConnectOk,
	socketConnectError,
	socketAuthOk
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
		socket.on('room:create:ok', (room) => {
			dispatch(socketRoomCreateOk(room));
		});
		socket.on('user:auth:ok', (user) => {
			dispatch(socketAuthOk(user));
		});
	}

	emit(eventName, param) {
		//	console.log(`emit [${eventName}] -->`, param);
		this.socket.emit(eventName, param);
	}
}

export default new SocketClient();
