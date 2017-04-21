// ------------------------------------
// Constants
// ------------------------------------
export const SOCKET_CONNECT_BEGIN = 'SOCKET_CONNECT_BEGIN';
export const SOCKET_CONNECT_OK = 'SOCKET_CONNECT_OK';
export const SOCKET_CONNECT_ERROR = 'SOCKET_CONNECT_ERROR';
export const SOCKET_EMIT_ROOM_CREATE = 'SOCKET_EMIT_ROOM_CREATE';

export const actions = {
	SOCKET_CONNECT_BEGIN,
	SOCKET_CONNECT_OK,
	SOCKET_CONNECT_ERROR,
	SOCKET_EMIT_ROOM_CREATE
};

// ------------------------------------
// Default state
// ------------------------------------
const defaultState = {
	isConnected: false,
	isConnecting: false,
	error: null
};

// ------------------------------------
// Action Creators
// ------------------------------------
export const socketConnectBegin = () => ({
	type: SOCKET_CONNECT_BEGIN
});

export const socketConnectOk = () => ({
	type: SOCKET_CONNECT_OK
});

export const socketConnectError = (error) => ({
	type: SOCKET_CONNECT_ERROR,
	payload: {error}
});

export const socketEmitRoomCreate = (room) => ({
	type: SOCKET_EMIT_ROOM_CREATE,
	payload: {room}
});

export const actionCreators = {
	socketConnectBegin,
	socketConnectOk,
	socketConnectError,
	socketEmitRoomCreate
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[SOCKET_CONNECT_BEGIN]: (state, {payload}) => ({
		...state,
		isConnecting: true,
		isConnected: false,
		error: null
	}),
	[SOCKET_CONNECT_OK]: (state, {payload}) => ({
		...state,
		isConnecting: false,
		isConnected: true,
		error: null
	}),
	[SOCKET_CONNECT_ERROR]: (state, {payload}) => ({
		...state,
		isConnecting: false,
		isConnected: false,
		error: payload.error
	})
};

// ------------------------------------
// Reducer
// ------------------------------------

export default function socketReducer(state = defaultState, action) {
	const handler = ACTION_HANDLERS[action.type];
	return handler ? handler(state, action) : state;
}
