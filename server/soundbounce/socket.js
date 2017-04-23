import socketIo from 'socket.io';
import _debug from 'debug';
const debug = _debug('app:server:socket');
import {User} from './data/schema';

const io = socketIo();

export default (app) => {
	app.io = io;
	io.on('connection', (socket) => {
		debug(`Socket client connected`);
		socket.on('user:auth', ({accessToken}) => {
			User.findOne({where: {accessToken}}).then(currentUser => {

				if (currentUser === null) {
					debug('Unknown accessToken sent during initial socket handshake');
					socket.close();
					return;
				}
				debug(`${currentUser.get('name')} (${currentUser.get('id')} connected over socketio`);

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
			});
		});
	});

};
