import shortid from 'shortid';
import _debug from 'debug';
const debug = _debug('app:server:rooms');
import {Room, RoomActivity, RoomActivities} from '../data/schema';

export default class Rooms {
	activeRooms = [];

	createRoom(roomOptions) {
		debug(`Creating room "${roomOptions.name}"`);
		return Room.create({
			id: shortid.generate(),
			name: roomOptions.name,
		});
	}

	joinRoom(roomId, user) {
		// leave a room if we're in a different room before we join this one.
		const currentRoomId = user.get('currentRoomId');
		const leaveFirst = (currentRoomId && currentRoomId !== roomId)
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
			}).catch(roomNotFoundError => {
				return Promise.reject(
					new Error(`joinRoom error - room (${roomId}) not  found. ` + roomNotFoundError)
				);
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

