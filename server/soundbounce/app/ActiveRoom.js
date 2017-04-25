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
	}

	// called when last user leaves a room so shuts down
	shutdown() {
		debug(`Active room shutdown for '${this.name}'`);
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

	// client sending a message to this room
	handleRoomEventMessage({sender, message}) {
		debug(`handleRoomEventMessage()`);
	}

	emit(eventName, args) {
		this.app.io.to(`room:${this.id}`).emit(eventName, args);
	}
}
