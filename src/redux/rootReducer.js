import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';

import spotify from './modules/spotify';
import socket from './modules/socket';
import users from './modules/users';

export default combineReducers({
	router,
	spotify,
	socket,
	users
});
