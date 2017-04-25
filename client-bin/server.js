import config from '../config';
import app from '../server/main';
import _debug from 'debug';
import http from 'http';

const server = http.Server(app);
const debug = _debug('soundbounce:bin:server');
const port = config.server_port;
const host = config.server_host;

server.on('error', err => {
	debug('http error: ' + err);
});

app.ready = () => {
	server.listen(port);
	app.io.listen(server); // this is set in socket.js
	debug(`Listening at http://${host}:${port}.`);
};



