import shortid from 'shortid';
import _debug from 'debug';
const debug = _debug('app:data:rooms');

export default class Rooms {
	constructor() {
		// store in memory for now, but access via an API so we can use db in future
		this.rooms = [];
	}

	getRoomById(roomId, callback) {
		callback(this.rooms[roomId]);
	}

	listAllRooms(callback) {
		callback(this.rooms);
	}

	createRoom(room, callback) {
		debug(`Creating room "${room.name}"`);
		if (!room.roomId) {
			room.roomId = shortid.generate();
			debug(`Room created with blank id, setting to ${room.roomId}`);
		} else {
			if (this.rooms[room.roomId]) {
				// this room already exists
				debug(`Attempt to create room with id ${room.roomId} which already existed.`);
				callback({
					error: {
						message: `Room with id ${room.roomId} already exists`
					}
				});
				return;
			}
		}

		// todo: insert into db
		this.rooms[room.roomId] = room;
		callback(room);
	}

	updateRoom(room, callback) {
		if (!room.roomId) {
			callback({
				error: {
					message: `Can't update room with missing roomId (${room.roomId})`
				}
			});
		}

		// todo: update in db
		this.rooms[room.roomId] = room;
		callback(room);
	}
}

