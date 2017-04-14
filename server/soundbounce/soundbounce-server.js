/**
 * Created by pb on 14/04/2017.
 */
import auth from './auth';

export default class SoundbounceServer {
	constructor(app) {
		this.app = app;
	}

	init() {
		console.log('initialising soundbounce server');
		auth(this.app);
	}
}
