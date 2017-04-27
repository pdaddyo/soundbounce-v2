import update from 'react-addons-update';

import {ROOM_FULL_SYNC} from './shared/room';

// ------------------------------------
// Constants
// ------------------------------------
export const USER_SET_CURRENT = 'USER_SET_CURRENT';

export const actions = {
	USER_SET_CURRENT
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
	type: USER_SET_CURRENT,
	payload: {user}
});

// ------------------------------------
// Selectors
// ------------------------------------
export const selectCurrentUser = (state) => (
	selectUser(state, state.users.currentUserId)
);

export const selectUser = (state, userid) => (
	userid ? state.users.users[userid] : null
);

export const selectUsers = (state, userIds) => (
	userIds.map(userId => selectUser(state, userId))
);

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[USER_SET_CURRENT]: (state, {payload}) => {
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
