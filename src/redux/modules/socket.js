// ------------------------------------
// Constants
// ------------------------------------
export const SOCKET_CONNECT_BEGIN = 'SOCKET_CONNECT_BEGIN';
export const SOCKET_CONNECT_OK = 'SOCKET_CONNECT_OK';
export const SOCKET_CONNECT_ERROR = 'SOCKET_CONNECT_ERROR';
export const SOCKET_EMIT_ROOM_CREATE = 'SOCKET_EMIT_ROOM_CREATE';
export const SOCKET_EMIT_ROOM_JOIN = 'SOCKET_EMIT_ROOM_JOIN';
export const SOCKET_EMIT_ROOM_EVENT = 'SOCKET_EMIT_ROOM_EVENT';
export const SOCKET_ROOM_CREATE_OK = 'SOCKET_ON_ROOM_CREATE_OK';
export const SOCKET_ROOM_JOIN_REQUEST = 'SOCKET_ROOM_JOIN_REQUEST';
export const SOCKET_ROOM_JOIN_OK = 'SOCKET_ROOM_JOIN_OK';
export const SOCKET_AUTH_OK = 'SOCKET_ON_AUTH_OK';

export const actions = {
	SOCKET_CONNECT_BEGIN,
	SOCKET_CONNECT_OK,
	SOCKET_CONNECT_ERROR,
	SOCKET_EMIT_ROOM_CREATE,
	SOCKET_EMIT_ROOM_JOIN,
	SOCKET_EMIT_ROOM_EVENT,
	SOCKET_ROOM_CREATE_OK,
	SOCKET_ROOM_JOIN_REQUEST,
	SOCKET_ROOM_JOIN_OK,
	SOCKET_AUTH_OK
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

export const socketEmitRoomJoin = (roomId) => ({
	type: SOCKET_EMIT_ROOM_JOIN,
	payload: {roomId}
});

export const socketEmitRoomEvent = ({roomId, event}) => ({
	type: SOCKET_EMIT_ROOM_EVENT,
	payload: {roomId, event}
});

export const socketRoomCreateOk = (room) => ({
	type: SOCKET_ROOM_CREATE_OK,
	payload: {room}
});

export const socketRoomJoinRequest = (roomId) => ({
	type: SOCKET_ROOM_JOIN_REQUEST,
	payload: {roomId}
});

export const socketAuthOk = (user) => ({
	type: SOCKET_AUTH_OK,
	payload: {user}
});

export const socketRoomJoinOk = (roomId) => ({
	type: SOCKET_ROOM_JOIN_OK,
	payload: {roomId}
});

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
