import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import classes from './playerStatus.css';

class SpotifyPlayerStatus extends Component {
	static propTypes = {
		player: PropTypes.object
	};

	render() {
		const {player} = this.props;
		// no player state so return nothing
		if (!player) {
			return null;
		}

		return (
			<div className={classes.status}>
				{player.is_playing ? 'PLAYING!' : 'SILENCE!'}

				{player.is_playing && (
					<img src={player.item.album.images[0].url}/>
				)}
			</div>
		);
	}
}

// map the spotify player state to prop 'player'
const mapStateToProps = state => ({
	player: state.spotify.player
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SpotifyPlayerStatus);

