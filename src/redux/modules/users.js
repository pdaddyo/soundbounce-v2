import update from 'react-addons-update';

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
	}
};

// ------------------------------------
// Reducer
// ------------------------------------

export default function usersReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
