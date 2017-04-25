import socketIo from 'socket.io';
import {User} from './data/schema';
import _debug from 'debug';
const debug = _debug('soundbounce:server:socket');

const io = socketIo();

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
				app.connections.addAuthenticatedSocket({socket, authenticatedUser: currentUser});
			});
		});
	});
};

