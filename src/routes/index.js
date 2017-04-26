import React from 'react';
import {Route, IndexRoute} from 'react-router';

import CoreLayout from 'layouts/CoreLayout/CoreLayout';
import HomeView from 'views/HomeView/HomeView';
import RoomView from 'views/RoomView/RoomView';
import NoMatchView from 'views/NoMatchView/NoMatchView';

export default (store) => (
	<Route path='/' component={CoreLayout}>
		<IndexRoute component={HomeView}/>
		<Route path='home' component={HomeView}/>
		<Route path='room/:roomId' component={RoomView}/>
		<Route path='*' component={NoMatchView}/>
	</Route>
);
