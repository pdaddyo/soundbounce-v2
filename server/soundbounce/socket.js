import socketIo from 'socket.io';
import _debug from 'debug';
const debug = _debug('app:server:socket');

const io = socketIo();

export default (app) => {
	app.io = io;
	io.on('connection', (socket) => {
		debug('A user connected');

		socket.on('login', (loginOptions) => {
			debug('login rec');
			socket.emit('hello', {
				message: 'blah'
			});
		});
	});
};
