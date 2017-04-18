import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';

import spotify from './modules/spotify';

export default combineReducers({
	router,
	spotify
});
