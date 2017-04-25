/**
 * Created by paulbarrass on 25/04/2017.
 */
import _debug from 'debug';
const debug = _debug('soundbounce:rooms:active');

export default class ActiveRoom {
	constructor({room, app}) {
		this.room = room;
		this.app = app;
		this.id = room.get('id');
		this.name = room.get('name');
	}

	startup() {
		// called when first user joins a room
		debug(`Active room startup() for '${this.name}'`);
	}

	emit(eventName, args) {
		this.app.io.to(`room:${this.id}`).emit(eventName, args);
	}

	shutdown() {
		// called when last user leaves a room
		debug(`Active room shutdown() for '${this.name}'`);
	}
}
