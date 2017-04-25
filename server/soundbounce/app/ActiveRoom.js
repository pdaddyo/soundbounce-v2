/**
 * Created by paulbarrass on 25/04/2017.
 */
import _debug from 'debug';
const debug = _debug('soundbounce:active:room');

export default class ActiveRoom {
	constructor(room) {
		this.room = room;
		this.id = room.get('id');
		this.name = room.get('name');
	}

	startup() {
		// called when first user joins a room
		debug(`Active room startup() for '${this.name}'`);
	}

	shutdown() {
		// called when last user leaves a room
		debug(`Active room shutdown() for '${this.name}'`);
	}
}
