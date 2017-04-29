/**
 * Created by paulbarrass on 25/04/2017.
 */
import _debug from 'debug';
import update from 'react-addons-update';
import {createStore, applyMiddleware, combineReducers, compose} from 'redux';
import roomReducer, {
	roomFullSync,
	roomTrackAddOrVote,
	roomUserJoin,
	roomUserLeave,
	actions as roomActions
} from '../../../src/redux/modules/shared/room';

const debug = _debug('soundbounce:rooms:active');

export default class ActiveRoom {
	constructor({room, app}) {
		this.room = room;
		this.app = app;
		this.id = room.get('id');
		this.name = room.get('name');
		this.reduxStore = null;
	}

	// called when first user joins a room so room goes active
	startup() {
		debug(`Active room startup for '${this.name}'`);
		this.createReduxStore();
		// save default state so it's sent to first client
		this.room.set('reduxState', this.reduxStore.getState());
	}

	// called when last user leaves a room so shuts down (pauses) until someone rejoins
	shutdown() {
		debug(`Active room shutdown for '${this.name}'`);
		// remove from the rooms list
		this.removeFromList();
		// store the state in the db
		this.room.set('reduxState', this.reduxStore.getState());
		return this.room.save();
	}

	// create a redux store on server that will match that on client, so we
	// can pass action messages around and know the state is in sync
	createReduxStore() {
		const reducer = roomReducer;
		this.reduxStore = createStore(reducer);
		const existingState = this.room.get('reduxState');
		if (existingState !== null) {
			debug('Found state in db, applying to redux');
			this.reduxStore.dispatch(roomFullSync({
				room: {
					reduxState: existingState,
					listeners: []
				}
			}));
		} else {
			// sync with default state
			this.reduxStore.dispatch(roomFullSync({
				room: {
					reduxState: this.reduxStore.getState(),
					listeners: []
				}
			}));
		}
	}

	// get a full state object that allows the client to render everything in this room without
	// any further immediate api calls.
	// so room state, plus short form for tracks, artists and users mentioned
	getFullSync() {
		const roomPlain = this.room.get({plain: true});
		// send back the plain sequelize object which includes the jsonb for the 'reduxState'
		const room = {
			...roomPlain,
			listeners: this.app.connections
				.getConnectedUsersForRoom(this.id)
				.map(user => user.get('id'))
		};

		/* todo: users from room events, track votes, listeners, creator */

		const users = this.app.users.getUsersToSendWithRoomSync(room.listeners, room.id);

		return Promise.all([users]).then(([users]) => ({
			room,
			// todo: parse the room state and pull out this info from db
			tracks: {
				'2sZoykkHTyTbK4cc3cK5iE': {
					name: 'Blah'
				}
			},
			artists: {},
			users
		})).catch(err => {
			debug('Error in getFullSync: ', err);
		});
	}

	// client sending a message to this room
	handleRoomEventMessage({sender, event}) {
		if (event.type === 'addOrVote') {
			const {trackIds} = event;
			// ensure they're in our database
			this.app.tracks.findOrQueryApi(trackIds).then(tracks => {
				this.reduxStore.dispatch(roomTrackAddOrVote({
					userId: sender.get('id'),
					trackIds
				}));
			});
		}
	}

	emitSimpleUserEvent = (reduxAction) => {
		const {emit, app, id} = this;
		const {userId} = reduxAction.payload;

		// add timestamp (on server only, clients don't generate timestamps)
		const actionWithTimestamp = update(reduxAction, {timestamp: {$set: new Date()}});

		// tell client to dispatch action
		app.users.getUsersToSendWithRoomSync([userId], id).then(users => {
			emit('room:event', {
				reduxAction: actionWithTimestamp,
				users
			});
		});
		// dispatch the same action on server too
		this.reduxStore.dispatch(actionWithTimestamp);
	};

	emitUserJoin = ({userId}) => (this.emitSimpleUserEvent(roomUserJoin(userId)));
	emitUserLeave = ({userId}) => (this.emitSimpleUserEvent(roomUserLeave(userId)));

	// emit an event over the network to every client that is in this room
	emit = (eventName, args) => {
		this.app.io.to(`room:${this.id}`).emit(eventName, args);
	};
}
