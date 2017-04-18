import React, {PropTypes, Component} from 'react';
import {spotifyAuthInit} from 'redux/modules/spotify';

import classes from './layout.css';

class CoreLayout extends Component {
	static propTypes = {
		children: PropTypes.any
	};

	static contextTypes = {
		router: PropTypes.object,
		dispatch: PropTypes.func
	};

	componentDidMount() {
		// if this mounts, the app is starting for the first time
		this.startup();
	}

	startup() {
		this.checkHashForAccessToken();
	}

	checkHashForAccessToken() {
		const {hash, href} = window.location;
		const {dispatch} = this.context;
		if (hash) {
			const matches = hash.match(/access_token=(.+)&refresh_token=(.+)/);
			if (matches) {
				const [, accessToken, refreshToken] = matches;
				dispatch(spotifyAuthInit({accessToken, refreshToken}));
				// strip the hash so we don't share it accidentally
				history.replaceState({}, document.title,
					href.substr(0, href.length - hash.length));
			}
		}
	}

	render() {
		const {children} = this.props;
		return (
			<div className={classes.app}>
				Soundbounce v2
				{children}
			</div>
		);
	}
}

export default CoreLayout;
