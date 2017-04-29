import update from 'react-addons-update';
// ------------------------------------
// Constants
// ------------------------------------
export const UI_UPDATE = 'UI_UPDATE';

export const actions = {
	UI_UPDATE
};

// ------------------------------------
// Default state
// ------------------------------------
const defaultState = {};

// ------------------------------------
// Action Creators
// ------------------------------------
export const uiUpdate = ({key, newState}) => ({
	type: UI_UPDATE,
	payload: {key, newState}
});

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[UI_UPDATE]: (state, {payload}) => update(state, {[payload.key]: {$set: payload.newState}})
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function uiReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
