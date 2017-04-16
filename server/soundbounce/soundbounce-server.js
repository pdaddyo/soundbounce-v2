/**
 * Created by pb on 14/04/2017.
 */
import auth from './auth';
import socket from './socket';

import _debug from 'debug';

const debug = _debug('app:soundbounce:server');

export default class SoundbounceServer {
	constructor(app) {
		this.app = app;
	}

	init() {
		debug('initalising app...');
		auth(this.app);
		socket(this.app);
		debug('init OK');
	}
}
