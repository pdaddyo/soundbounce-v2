/**
 * Created by pb on 14/04/2017.
 */
import auth from './auth';
import socket from './socket';
import Rooms from './data/Rooms';
import {syncDatabaseSchema} from './data/schema';

import _debug from 'debug';

const debug = _debug('app:soundbounce:server');

export default class SoundbounceServer {
	constructor(app) {
		this.app = app;
	}

	init() {
		debug('Begin server init...');
		const {app} = this;

		socket(app);
		auth(app);
		syncDatabaseSchema(() => {
			app.data = {
				rooms: new Rooms()
			};
			debug('Server init OK');
		});
	}
}
