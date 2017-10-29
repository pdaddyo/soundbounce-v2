import config from '../../../config/app';
import _debug from 'debug';
const debug = _debug('soundbounce:connections');
import {Room, TrackActivity} from '../data/schema';
import sequelize from 'sequelize';

export default class Connections {
	constructor(app) {
		this.app = app;
		this.connectedSockets = [];
	}

	// a user may have multiple sockets, but we just want the unique users
	// we could in theory query this from db but that would end up slow / bottlenecking
	getConnectedUsersForRoom(roomId) {
		const users = [];
		for (let socket of this.connectedSockets) {
			if (socket.authenticatedUser.get('currentRoomId') === roomId) {
				if (!users.find(u => u.get('id') === socket.authenticatedUser.get('id'))) {
					users.push(socket.authenticatedUser);
				}
			}
		}
		return users;
	}

	getAllSocketsForUserId(userId) {
		return this.connectedSockets.filter(socket => socket.authenticatedUser.get('id') === userId);
	}

	addAuthenticatedSocket({socket, authenticatedUser}) {
		const plainUserObject = authenticatedUser.get({plain: true});
		// send the current user info back to the client
		socket.emit('user:auth:ok', plainUserObject);
		// send server time so client knows ms offset
		socket.emit('server:time', {ticks: new Date().getTime()});
		// notify client of server version - they'll refresh if wrong
		const {buildVersion} = config;
		socket.emit('server:version', {buildVersion});
		socket.on('disconnect', s => {
			this.removeClient(socket);
		});

		// check if any other clients already connected have this id, and use their user object
		for (let otherSocket of this.connectedSockets) {
			if (otherSocket.authenticatedUser.get('id') === plainUserObject.id) {
				authenticatedUser = otherSocket.authenticatedUser;
				break;
			}
		}

		// attach some useful info to the socket
		socket.authenticatedUser = authenticatedUser;
		socket.debugUserName = `${plainUserObject.nickname} (${plainUserObject.id})`;

		// join room shared for all logged in instances of this user
		socket.allSocketsForThisUser = `user:${plainUserObject.id}`;
		socket.join(socket.allSocketsForThisUser);

		this.connectedSockets.push(socket);
		this.addSocketEventListeners(socket);
		debug(`${socket.debugUserName} connected, ${this.connectedSockets.length} total clients.`);
	}

	joinRoom({socket, roomId}) {
		this.app.rooms.joinRoom(roomId, socket.authenticatedUser).then(activeRoom => {
			// on first join send back a full room sync
			activeRoom.getFullSync().then(fullSync => {
				this.app.io.to(socket.allSocketsForThisUser).emit('room:join:ok', fullSync);
			});
		});
	}

	removeClient(socket) {
		// remove from the connectedSockets list
		this.connectedSockets = this.connectedSockets.filter(sock => sock !== socket);
		debug(`${socket.debugUserName} disconnected, ${this.connectedSockets.length} clients connected.`);

		const userHasOtherSocketsOpen = this.connectedSockets.filter(sock => sock.authenticatedUser.get('id') === socket.authenticatedUser.get('id')).length > 0;

		if (!userHasOtherSocketsOpen) {
			// this was the last socket closed by this user, so leave any room they might be in
			const roomId = socket.authenticatedUser.get('currentRoomId');
			if (roomId) {
				this.app.rooms.leaveRoom(roomId, socket.authenticatedUser);
			}
		}
	}

	addSocketEventListeners(socket) {
		const {app} = this;
		socket.on('room:create', (roomOptions) => {
			if (!roomOptions.name) {
				return;
			}
			app.rooms.createRoom(roomOptions)
				.then(room => {
					room.setCreator(socket.authenticatedUser);
					room.save().then((room) => {
						socket.emit('room:create:ok', {roomId: room.get('id')});
						this.joinRoom({socket, roomId: room.get('id')});
					});
				});
		});

		socket.on('room:join', roomId => {
			this.joinRoom({socket, roomId})
		});

		socket.on('user:current', () => {
			socket.emit('user:current:ok', socket.authenticatedUser.get({plain: true}));
		});

		socket.on('user:prefs:save', prefsToSave => {
			const prefs = {...socket.authenticatedUser.get('prefs'), ...prefsToSave};
			// console.log('saving ' + JSON.stringify(prefs));
			socket.authenticatedUser.update({prefs}).then(() => {
				app.io.to(socket.allSocketsForThisUser).emit('user:prefs:ok', prefs);
			});
		});

		socket.on('room:event', ({roomId, event}) => {
			const activeRoom = app.rooms.findActiveRoom(roomId);
			if (!activeRoom) {
				debug('Unable to process room message for inactive room ' + roomId);
				return;
			}
			activeRoom.handleRoomEventMessage({sender: socket.authenticatedUser, event});
		});

		socket.on('home:data', () => {
			const {activeRooms} = app.rooms;
			// find all rooms with recent activity, and any active rooms
			Room
				.findAll({
					limit: 30,
					order: [['updatedAt', 'DESC']],
					where: activeRooms.length > 0
						? {id: {$notIn: activeRooms.map(ar => ar.id)}}
						: null
				})
				.then(popularRooms => {
					// get now playing track for all these rooms
					return this.app.tracks.findTracksInDb(
						[...popularRooms.map(r => r.get('nowPlayingTrackId')),
						 ...activeRooms.map(activeRoom =>
							 activeRoom.room.get('nowPlayingTrackId'))])
						.then(tracks => {
							app.io.to(socket.allSocketsForThisUser).emit('home:data:ok', {
								activeRooms: activeRooms.map(activeRoom =>
									(activeRoom.room.get({plain: true})),
								),
								popularRooms: popularRooms.map(room => (room.get({plain: true}))),
								tracks: tracks.map(track => track.get({plain: true}))
							});
						});

				});
		});

		socket.on('room:stats', ({roomId}) => {
			TrackActivity.findAll({
				group: ['trackId'],
				attributes: ['trackId', [sequelize.fn('count', sequelize.col('trackId')), 'trackCount']],
				where: {roomId: {$eq: roomId}},
				order: [[sequelize.fn('count', sequelize.col('trackId')), 'DESC']],
				limit: 20
			}).then(result => this.app.tracks.findTracksInDb(
				result.map(r => r.get('trackId')))
				.then(tracks => {
					app.io.to(socket.allSocketsForThisUser).emit('room:stats:ok', {
						stats: {
							topTracks: result.map(r => ({
								id: r.get('trackId'),
								plays: r.get('trackCount')
							})),
							topArtists: [],
							topUsers: []
						},
						tracks: tracks.map(track => track.get({plain: true})),
						roomId
					})
				}));
		});
	}
}
