import sequelize from './sequelize';

import shortid from 'shortid';
import _debug from 'debug';
const debug = _debug('app:data:rooms');
import {Room} from './schema';

export default class Rooms {
	createRoom(roomOptions) {
		debug(`Creating room "${roomOptions.name}"`);
		return Room.create({
			id: shortid.generate(),
			name: roomOptions.name,
		});
	}
}

