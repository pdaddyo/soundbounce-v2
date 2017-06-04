import update from 'react-addons-update';
// ------------------------------------
// Constants
// ------------------------------------
export const LINK_UNFURLING_REQUEST_START = 'LINK_UNFURLING_BEGIN_REQUEST';
export const LINK_UNFURLING_REQUEST_OK = 'LINK_UNFURLING_REQUEST_OK';
export const LINK_UNFURLING_TOGGLE_HIDE = 'LINK_UNFURLING_TOGGLE_HIDE';

export const actions = {
	LINK_UNFURLING_REQUEST_START,
	LINK_UNFURLING_REQUEST_OK,
	LINK_UNFURLING_TOGGLE_HIDE
};

// ------------------------------------
// Default state
// ------------------------------------
const defaultState = {
	urls: {}  // url objects stored by key in the shape:
	// url: {pending, hidden, json}
};

// ------------------------------------
// Action Creators
// ------------------------------------

export const linkUnfurlingRequestStart = ({url}) => ({
	type: LINK_UNFURLING_REQUEST_START,
	payload: {url}
});

export const linkUnfurlingRequestOk = ({url, json}) => ({
	type: LINK_UNFURLING_REQUEST_OK,
	payload: {url, json}
});

export const linkUnfurlingToggleHide = ({url}) => ({
	type: LINK_UNFURLING_TOGGLE_HIDE,
	payload: {url}
});

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[LINK_UNFURLING_REQUEST_START]: (state, {payload}) => (
		update(state, {urls: {[payload.url]: {$set: {pending: true}}}})
	),
	[LINK_UNFURLING_REQUEST_OK]: (state, {payload}) => {
		return update(state, {
			urls: {
				[payload.url]: {
					$set: {
						hidden: false,
						pending: false,
						json: payload.json
					}
				}
			}
		});
	},
	[LINK_UNFURLING_TOGGLE_HIDE]: (state, {payload}) => (
		update(state, {urls: {[payload.url]: {hidden: {$apply: tf => !tf}}}})
	)
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function unfurlingReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
