import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';

import spotify from './modules/spotify';
import socket from './modules/socket';
import users from './modules/users';
import room from './modules/shared/room';
import home from './modules/home';
import ui from './modules/ui';

export default combineReducers({
	router,
	spotify,
	socket,
	users,
	room,
	home,
	ui
});
