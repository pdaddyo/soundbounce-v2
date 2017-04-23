import socketIo from 'socket.io';
import _debug from 'debug';
const debug = _debug('app:server:socket');

const io = socketIo();

export default (app) => {
	app.io = io;
	io.on('connection', (socket) => {
		debug('A user connected');

		// todo: only listen for an auth command, then store the user against this socket
		
		socket.on('room:create', (room) => {
			debug(`room:create (${room})`);
			app.data.rooms.createRoom(room)
				.then(room => {
					socket.emit('room:create:ok', room.get({plain: true}));
				});
		});
	});

};
