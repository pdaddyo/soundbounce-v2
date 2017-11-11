import React from 'react';
import {Route, IndexRoute} from 'react-router';

import CoreLayout from 'layouts/CoreLayout/CoreLayout';
import HomeView from 'views/HomeView/HomeView';
import HelpView from 'views/HelpView/HelpView';
import RoomView from 'views/RoomView/RoomView';

import NoMatchView from 'views/NoMatchView/NoMatchView';
import BrowseAlbumView from '../views/BrowseView/BrowseAlbumView';

export default (store) => (
	<Route path='/' component={CoreLayout}>
		<IndexRoute component={HomeView}/>
		<Route path='home' component={HomeView}/>
		<Route path='help' component={HelpView}/>
		<Route path='room/:roomId' component={RoomView}>
			<Route path='browse/album/:albumId' component={BrowseAlbumView}/>
			<Route path='browse/album/:albumId/:trackId' component={BrowseAlbumView}/>
		</Route>
		<Route path='room/:roomId/:roomTab' component={RoomView}/>
		<Route path='*' component={NoMatchView}/>
	</Route>
);
