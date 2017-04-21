import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';

import spotify from './modules/spotify';
import socket from './modules/socket';

export default combineReducers({
	router,
	spotify,
	socket
});
