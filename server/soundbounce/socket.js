import socketIo from 'socket.io';
import {User} from './data/schema';
import _debug from 'debug';
const debug = _debug('app:server:socket');

const io = socketIo();

let connectedSockets = [];

export default (app) => {
	app.io = io;
	io.on('connection', (socket) => {
		debug(`Socket client connected`);
		socket.on('user:auth', ({accessToken}) => {
			User.findOne({where: {accessToken}}).then(currentUser => {
				if (currentUser === null) {
					debug('Unknown accessToken sent during initial socket handshake');
					if (socket) {
						socket.emit('user:auth:error');
						socket.disconnect();
					}
					return;
				}
				const currentUserDebugName = `${currentUser.get('nickname')} (${currentUser.get('id')})`;

				socket.on('disconnect', s => {
					// remove from the connectedSockets list
					connectedSockets = connectedSockets.filter(sock => sock !== socket);
					debug(`${currentUserDebugName} disconnected, ${connectedSockets.length} still connected.`);

					//todo: check if this user is in any rooms and if this is their last tab

					const userHasOtherSocketsOpen = connectedSockets.filter(sock => sock.soundbounceUser.get('id') === currentUser.get('id')).length > 0;

					if (!userHasOtherSocketsOpen) {
						// this was the last socket closed by this user, so leave any room they might be in
						const roomId = currentUser.get('currentRoomId')
						if (roomId) {
							app.data.rooms.leaveRoom(roomId, currentUser);
						}
					}
				});

				const plainUserObject = currentUser.get({plain: true});
				// send the current user info back to the client
				socket.emit('user:auth:ok', plainUserObject);

				// join room shared for all logged in instances of this user
				const allCurrentUserSockets = `user:${plainUserObject.id}`;
				socket.join(allCurrentUserSockets);
				socket.soundbounceUser = currentUser;
				connectedSockets.push(socket);
				debug(`${currentUserDebugName} connected, ${connectedSockets.length} now connected.`);

				///
				/// User is now auth'd over sockets, so event listeners below are
				/// only available to users that are logged in properly.
				///
				socket.on('room:create', (roomOptions) => {
					app.data.rooms.createRoom(roomOptions)
						.then(room => {
							room.setCreator(currentUser);
							socket.emit('room:create:ok', room.get({plain: true}));

							// join the room we just created
							app.data.rooms.joinRoom(room.get('id'), currentUser).then(room => {
								// notify all connections from this user (via allUserConnections)
								socket.to(allCurrentUserSockets).emit('room:join:ok', {room});
							});
						});
				});

				socket.on('room:join', roomId => {
					app.data.rooms.joinRoom(roomId, currentUser).then(room => {
						socket.to(allCurrentUserSockets).emit('room:join:ok', {room});
					});
				});

				socket.on('user:current', () => {
					socket.emit('user:current:ok', currentUser.get({plain: true}));
				});
			});
		});
	});
};
