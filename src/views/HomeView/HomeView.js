/* @flow */
import React, {Component} from 'react';

import classes from './homeView.css';

class HomeView extends Component {
	static propTypes = {};

	render() {
		return (
			<div className={classes.container}>
				<a href='/login'>Login to Spotify...</a>
			</div>
		);
	}
}

export default HomeView;
