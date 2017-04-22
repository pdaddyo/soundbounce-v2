import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Title from '../track/Title';
import Artists from '../track/Artists';
import classes from './playerStatus.css';

class SpotifyPlayerStatus extends Component {
	static propTypes = {
		player: PropTypes.object
	};

	render() {
		const {player} = this.props;
		// no player state so return nothing
		if (!player || !player.item || !player.is_playing) {
			return null;
		}

		const {images} = player.item.album;
		const artwork = images ? `url(${images[images.length > 1 ? 1 : 0].url})` : 'none';

		return (
			<div className={classes.status}>
				<div className={classes.info}>
					<div className={classes.title}>
						<Title trackId={player.item.id}/>
					</div>
					<div className={classes.artists}>
						<Artists trackId={player.item.id}/>
					</div>

				</div>
				<div className={classes.artwork} style={{backgroundImage: artwork}}/>
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

