/**
 * Created by paulbarrass on 25/04/2017.
 */
import _debug from 'debug';
import {createStore, applyMiddleware, combineReducers, compose} from 'redux';
import roomReducer, {roomSetFullState} from '../../../src/redux/modules/shared/room';

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
		this.room.set('state', this.reduxStore.getState());
	}

	// called when last user leaves a room so shuts down (pauses) until someone rejoins
	shutdown() {
		debug(`Active room shutdown for '${this.name}'`);
		// store the state in the db
		this.room.set('state', this.reduxStore.getState());
		return this.room.save();
	}

	// create a redux store on server that will match that on client
	createReduxStore() {
		const reducer = roomReducer;
		this.reduxStore = createStore(reducer);
		const existingState = this.room.get('state');
		if (existingState !== null) {
			debug('Found state in db, applying to redux');
			this.reduxStore.dispatch(roomSetFullState(existingState));
		}
	}

	// get a full state object that allows the client to render everything in this room without
	// any further immediate api calls.
	// so room state, plus short form for tracks, artists and users mentioned
	getFullSync() {
		const room = this.room.get({plain: true});
		return {
			room,
			// todo: parse the room state and pull out this info from db
			tracks: {
				'2sZoykkHTyTbK4cc3cK5iE': {
					name: 'Blah'
				}
			},
			artists: {},
			users: {}
		}
	}

	// client sending a message to this room
	handleRoomEventMessage({sender, message}) {
		debug(`handleRoomEventMessage()`);
	}

	emit(eventName, args) {
		this.app.io.to(`room:${this.id}`).emit(eventName, args);
	}
}
