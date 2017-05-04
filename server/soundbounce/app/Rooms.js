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
		debug(`Creating new room "${roomOptions.name}"`);
		return Room.create({
			id: shortid.generate(),
			...roomOptions,
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

		const userId = user.get('id');

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
					userId,
					roomId
				});

				// tell any all sockets from this user to go to this room
				this.app.connections.getAllSocketsForUserId(userId).forEach(socket => {
					socket.join(`room:${roomId}`);
				});

				// notify users in the room
				activeRoom.emitUserJoin({userId});

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
		const userId = user.get('id');

		return Room.findOne({where: {id: roomId}}).then(room => {
			debug(`${user.get('nickname')} left ${room.name}`);

			user.set('currentRoomId', null);

			// log this leave
			RoomActivity.create({
				type: RoomActivities.userLeave,
				userId,
				roomId
			});

			this.app.connections.getAllSocketsForUserId(userId).forEach(socket => {
				socket.leave(`room:${roomId}`);
			});

			// save both user and room then return
			return Promise.all([
				user.save(),
				room.save()
			]).then(() => {
				// now the user is saved, check if the room is still active
				const activeRoom = this.findActiveRoom(roomId);
				if (activeRoom) {
					activeRoom.emitUserLeave({userId: user.get('id')});
					if (this.app.connections.getConnectedUsersForRoom(roomId).length === 0) {
						debug(`No more users left in room '${room.get('name')}', shutting down`);
						activeRoom.shutdown();
					}
				}
				return {success: true};
			})
		});
	}
}

