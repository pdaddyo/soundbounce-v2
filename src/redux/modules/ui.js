import update from 'react-addons-update';
import {ROOM_EMOJI_ANIMATION} from './shared/room';

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
	[UI_UPDATE]: (state, {payload}) =>
		update(state, {[payload.key]: {$set: payload.newState}}),
	[ROOM_EMOJI_ANIMATION]: (state, {payload}) =>
		update(state, {[`emoji-animation-${payload.emojiId}`]: {$set: payload.animation}})
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function uiReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
