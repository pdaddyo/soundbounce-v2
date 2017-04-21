/**
 * Created by pb on 14/04/2017.
 */
import auth from './auth';
import socket from './socket';
import Rooms from './data/Rooms';

import _debug from 'debug';

const debug = _debug('app:soundbounce:server');

export default class SoundbounceServer {
	constructor(app) {
		this.app = app;
	}

	init() {
		debug('Begin server init...');
		this.app.data = {
			rooms: new Rooms()
		};
		auth(this.app);
		socket(this.app);
		debug('Server init OK');
	}
}
