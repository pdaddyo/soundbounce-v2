/**
 * Created by paulbarrass on 25/04/2017.
 */
import _debug from 'debug';
const debug = _debug('soundbounce:tracks');
import {Track, TrackArtist, Artist} from '../data/schema';

export default class Tracks {
	constructor(app) {
		this.app = app;
	}

	findOrQueryApi(trackIds) {
		debug(`findOrQueryApi(${trackIds})`);

		// search our db for these tracks first
		return Track.findAll({
			where: {
				id: {$in: trackIds}
			},
			include: [Artist]
		}).then(tracks => {
			debug(tracks);
		});
	}
}
