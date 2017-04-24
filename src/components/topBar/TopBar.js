import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {selectCurrentUser} from 'redux/modules/users';

// import SpotifyPlayerStatus from 'components/player/SpotifyPlayerStatus';

import classes from './topBar.css';

class TopBar extends Component {
	static propTypes = {
		currentUser: PropTypes.object,
		player: PropTypes.object
	};

	render() {
		const {currentUser, player} = this.props;

		return (
			<div className={classes.topBar}>
				<div className={classes.soundbounce}>
					Soundbounce
				</div>
				<div className={classes.right}>
					{/* <SpotifyPlayerStatus/> */}

					<div className={classes.user}>

						<div className={classes.text}>
							<div className={classes.profileName}>
								Bouncing <span className={classes.room}>Boomtown</span>
							</div>
							<div className={classes.device}>
								to {player && player.device.name}
								<span className={classes.dropdownArrow}> ▼ </span>
							</div>
						</div>
						<div className={classes.avatar}
							 style={{backgroundImage: `url(${currentUser.avatar})`}}/>
					</div>

				</div>
			</div>
		);
	}
}

// map the spotify player state to prop 'player'
const mapStateToProps = state => ({
	currentUser: selectCurrentUser(state),
	player: state.spotify.player
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);

