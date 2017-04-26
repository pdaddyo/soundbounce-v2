import update from 'react-addons-update';

import {ROOM_FULL_SYNC} from './shared/room';

// ------------------------------------
// Constants
// ------------------------------------
export const SET_CURRENT_USER = 'SET_CURRENT_USER';

export const actions = {
	SET_CURRENT_USER
};

// ------------------------------------
// Default state
// ------------------------------------
const defaultState = {
	currentUserId: null,
	users: {}
};

// ------------------------------------
// Action Creators
// ------------------------------------
export const setCurrentUser = (user) => ({
	type: SET_CURRENT_USER,
	payload: {user}
});

// ------------------------------------
// Selectors
// ------------------------------------
export const selectCurrentUser = (state) => (
	state.users.currentUserId ? state.users.users[state.users.currentUserId] : null
);

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[SET_CURRENT_USER]: (state, {payload}) => {
		const {user} = payload;
		const newState = {
			...state,
			currentUserId: user.id,
			users: update(state.users, {[user.id]: {$set: user}})
		};
		return newState;
	},
	[ROOM_FULL_SYNC]: (state, {payload}) => {
		let {users} = payload.fullSync;
		let existingUsers = state.users;
		const updateCommand = {};

		// don't want to overwrite users if already have more info
		for (let user of users) {
			if (existingUsers[user.id]) {
				user = {...existingUsers[user.id], ...user};
			}
			updateCommand[user.id] = {$set: user};
		}

		return {
			...state,
			users: update(state.users, updateCommand)
		};
	}
};

// ------------------------------------
// Reducer
// ------------------------------------

export default function usersReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
