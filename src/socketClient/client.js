/*
 Socket.io / socket redux go-between
 */

import config from '../../config/app';
import io from 'socket.io-client';
import {
	socketRoomCreateOk,
	socketConnectOk,
	socketConnectError,
	socketAuthOk,
	socketRoomJoinRequest,
	socketRoomJoinOk,
	socketRoomEvent,
	socketHomeDataOk
} from 'redux/modules/socket';
import {homeSetData} from 'redux/modules/home';
import {roomFullSync, roomNavigating} from 'redux/modules/shared/room';
import {syncSetServerOffset} from '../redux/modules/sync';
import {socketRoomStatsOk} from '../redux/modules/socket';

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
		socket.on('server:time', ({ticks}) => {
			dispatch(syncSetServerOffset({ticks: (new Date().getTime()) - ticks}));
		});
		socket.on('server:version', ({buildVersion}) => {
			if (buildVersion !== config.buildVersion) {
				console.log(`Wrong client version! Server: ${buildVersion}, Client: ${config.buildVersion}`);
				/*				alert(`A new version of Soundbounce has just been deployed!

				 Press OK to refresh and load the latest version...`);
				 */
				location.reload(true);
			}
		});
		socket.on('room:create:ok', (room) => {
			dispatch(socketRoomCreateOk(room));
		});
		socket.on('room:join:request', (roomId) => {
			dispatch(socketRoomJoinRequest(roomId));
			socket.emit('room:join', roomId);
		});
		socket.on('room:join:ok', (fullSync) => {
			dispatch(roomNavigating(fullSync.room.id));
			dispatch(socketRoomJoinOk(fullSync.room.id));
			dispatch(roomFullSync(fullSync));
		});
		socket.on('room:sync', (fullSync) => {
			dispatch(roomFullSync(fullSync));
		});
		socket.on('room:event', (payload) => {
			dispatch(socketRoomEvent(payload));
		});
		socket.on('room:stats:ok', (payload) => {
			dispatch(socketRoomStatsOk(payload));
		});
		socket.on('home:data:ok', (home) => {
			dispatch(socketHomeDataOk(home));
			dispatch(homeSetData(home));
		});
	}

	emit(eventName, param) {
		this.socket.emit(eventName, param);
	}
}

export default new SocketClient();
