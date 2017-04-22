import React, {Component} from 'react';
import {connect} from 'react-redux';
import SpotifyPlayerStatus from 'components/player/SpotifyPlayerStatus';

import classes from './topBar.css';

class TopBar extends Component {
	static propTypes = {};

	render() {
		return (
			<div className={classes.topBar}>
				<div className={classes.soundbounce}>
					Soundbounce
				</div>
				<div className={classes.playerStatus}>
					<SpotifyPlayerStatus/>
				</div>
			</div>
		);
	}
}

// map the spotify player state to prop 'player'
const mapStateToProps = state => ({
	profile: state.spotify.profile,
	devices: state.spotify.devices
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);

