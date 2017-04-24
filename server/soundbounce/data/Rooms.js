import shortid from 'shortid';
import _debug from 'debug';
const debug = _debug('app:data:rooms');
import {Room, RoomActivity, RoomActivities} from './schema';

export default class Rooms {
	createRoom(roomOptions) {
		debug(`Creating room "${roomOptions.name}"`);
		return Room.create({
			id: shortid.generate(),
			name: roomOptions.name,
		});
	}

	joinRoom(roomId, user) {
		// leave a room if we're in one before we join another one.
		const leaveFirst = user.get('currentRoomId')
			? this.leaveRoom(user.get('currentRoomId'), user)
			: Promise.resolve({success: true});

		return leaveFirst.then(() => {
			return Room.findOne({where: {id: roomId}}).then(room => {
				debug(`${user.get('nickname')} joined ${room.get('name')}`);

				room.set('active', true); // todo: decide if we're using this active thing
				user.set('currentRoomId', room.id);

				// log this join
				RoomActivity.create({
					type: RoomActivities.userJoin,
					userId: user.get('id'),
					roomId
				});

				// save both user and room then return
				return Promise.all([
					user.save(),
					room.save()
				]).then(() => room.get({plain: true}));
			});
		});
	}

	leaveRoom(roomId, user) {
		return Room.findOne({where: {id: roomId}}).then(room => {
			debug(`${user.get('nickname')} left ${room.name}`);

			// todo: work out if room is still active....

			user.set('currentRoomId', null);

			// log this leave
			RoomActivity.create({
				type: RoomActivities.userLeave,
				userId: user.get('id'),
				roomId
			});

			// save both user and room then return
			return Promise.all([
				user.save(),
				room.save()
			]).then(() => ({
					success: true
				})
			);
		});
	}
}

