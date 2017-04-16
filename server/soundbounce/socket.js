
import socketIo from 'socket.io';

const io = socketIo();

export default (app) => {
	app.io = io;
	io.on('connection', (socket) => {
		console.log('A user connected');

		socket.on('login', (loginOptions) => {
			console.log('login rec');
			socket.emit('hello', {
				message: 'blah'
			});
		});
	});
};
