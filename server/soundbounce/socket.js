import socketIo from 'socket.io';
import _debug from 'debug';
const debug = _debug('app:server:socket');

const io = socketIo();

export default (app) => {
	app.io = io;
	io.on('connection', (socket) => {
		debug('A user connected');

		socket.on('room:create', (room) => {
			debug(`room:create (${room})`);
			app.data.rooms.createRoom(room, (room) => {
				if (room.error) {
					debug(`room:create:error - ${room.error.message}`);
					socket.emit('room:create:error', room)
				} else {
					socket.emit('room:create:ok', room);
				}
			});
		});

		setInterval(function () {
			io.emit('server:time', new Date);
		}, 1000);
	});
};
