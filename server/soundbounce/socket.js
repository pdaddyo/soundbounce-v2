
import socketIo from 'socket.io';

const io = socketIo();

export default (app) => {
	app.io = io;
	io.on('connection', (socket) => {
		console.log('A user connected');
	});
};
