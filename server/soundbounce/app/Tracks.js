/**
 * Created by paulbarrass on 25/04/2017.
 */
import _debug from 'debug';
const debug = _debug('soundbounce:tracks');

export default class Tracks {
	constructor(app) {
		this.app = app;
	}

	findOrQueryApi(trackIds) {
		debug(`findOrQueryApi(${trackIds})`);
		//todo: implement this

		return Promise.resolve({tracks: []});
	}
}
