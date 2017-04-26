import shortid from 'shortid';
import _debug from 'debug';
const debug = _debug('soundbounce:rooms');
import {Room, RoomActivity, RoomActivities} from '../data/schema';
import ActiveRoom from './ActiveRoom';

export default class Rooms {
	constructor(app) {
		this.app = app;
	}

	activeRooms = [];

	createRoom(roomOptions) {
		debug(`Creating room "${roomOptions.name}"`);

		return Room.create({
			id: shortid.generate(),
			name: roomOptions.name,
			state: null,
			nowPlayingStartedAt: null,
			nowPlayingTrackId: null
		});
	}

	findActiveRoom(roomId) {
		return this.activeRooms.find(activeRoom => activeRoom.id === roomId);
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

				user.set('currentRoomId', roomId);

				let activeRoom = this.findActiveRoom(roomId);
				if (!activeRoom) {
					activeRoom = new ActiveRoom({room, app: this.app});
					activeRoom.removeFromList = () => {
						this.activeRooms = this.activeRooms.filter(activeRoom => activeRoom.id !== roomId);
					};
					activeRoom.startup();
					this.activeRooms.push(activeRoom);
				}

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
				]).then(() => activeRoom);
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
			]).then(() => {
				// now the user is saved, check if the room is still active
				const activeRoom = this.findActiveRoom(roomId);
				if (activeRoom && this.app.connections.getConnectedUsersForRoom(roomId).length === 0) {
					debug(`No more users left in room '${room.get('name')}', shutting down`);
					activeRoom.shutdown();
				}
				return {success: true};
			})
		});
	}
}

