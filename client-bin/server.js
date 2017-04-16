import config from '../config';
import app from '../server/main';
import _debug from 'debug';
import http from 'http';

const server = http.Server(app);
const debug = _debug('app:bin:server');
const port = config.server_port;
const host = config.server_host;

server.on('error', err => {
	debug('http error' + err);
});

server.listen(port);

const io = app.io; // this is set in socket.js
io.listen(server);

debug(`Server is now running at http://${host}:${port}.`);


