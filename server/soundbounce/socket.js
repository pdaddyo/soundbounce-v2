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
						socket.disconnect();
					}
					return;
				}
				const currentUserDebugName = `${currentUser.get('nickname')} (${currentUser.get('id')})`;

				connectedSockets.push(socket);
				socket.on('disconnect', s => {
					// remove from the connectedSockets list
					connectedSockets = connectedSockets.filter(sock => sock !== socket);
					debug(`${currentUserDebugName} disconnected, ${connectedSockets.length} still connected.`);
				});

				debug(`${currentUserDebugName} connected, ${connectedSockets.length} now connected.`);

				// send the current user info back to the client
				socket.emit('user:auth:ok', currentUser.get({plain: true}));

				///
				/// User is now auth'd over sockets, so event listeners below are
				/// only available to users that are logged in properly.
				///
				socket.on('room:create', (room) => {
					debug(`room:create (${room})`);
					app.data.rooms.createRoom(room)
						.then(room => {
							room.setCreator(currentUser);
							socket.emit('room:create:ok', room.get({plain: true}));
						});
				});

				socket.on('user:current', () => {
					debug(`user:current`);
					socket.emit('user:current:ok', currentUser.get({plain: true}));
				});
			});
		});
	});
};
