import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
// import SpotifyPlayerStatus from 'components/player/SpotifyPlayerStatus';

import classes from './topBar.css';

class TopBar extends Component {
	static propTypes = {
		profile: PropTypes.object,
		player: PropTypes.object
	};

	render() {
		const {profile, player} = this.props;

		let avatarImg = 'none';
		if (profile && profile.images && profile.images.length > 0) {
			avatarImg = `url(${profile.images[0].url})`;
		}
		// const [, firstName] = profile.display_name.match(/(.+) /);
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
							 style={{backgroundImage: avatarImg}}/>
					</div>

				</div>
			</div>
		);
	}
}

// map the spotify player state to prop 'player'
const mapStateToProps = state => ({
	profile: state.spotify.profile,
	player: state.spotify.player
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);

