import React from 'react';
import {Route, IndexRoute} from 'react-router';

import CoreLayout from 'layouts/CoreLayout/CoreLayout';
import HomeView from 'views/HomeView/HomeView';
import NoMatchView from 'views/NoMatchView/NoMatchView';

export default (store) => (
	<Route path='/' component={CoreLayout}>
		<IndexRoute component={HomeView}/>
		<Route path='home' component={HomeView}/>
		<Route path='*' component={NoMatchView}/>
	</Route>
);
