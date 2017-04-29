import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {selectCurrentUser} from 'redux/modules/users';
import Avatar from 'components/user/avatar/Avatar';
import {Link} from 'react-router';
import SettingsIcon from 'components/svg/icons/Settings';

import SpotifyPlayerStatus from 'components/player/SpotifyPlayerStatus';

import theme from './mainNavigation.css';

class TopBar extends Component {
	static propTypes = {
		currentUser: PropTypes.object,
		player: PropTypes.object
	};

	render() {
		const {currentUser, player} = this.props;

		return (
			<div className={theme.topBar}>
				<div className={theme.soundbounce}>
					<Link to='/'>Soundbounce</Link>
				</div>
				<div className={theme.right}>
					<SpotifyPlayerStatus/>

					<div className={theme.user}>

						<div className={theme.text}>
							<div className={theme.profileName}>
								Bouncing <span className={theme.room}>Boomtown</span>
							</div>
							<div className={theme.device}>
								to {player && player.device.name}
								<span className={theme.dropdownArrow}> ▼ </span>
							</div>
						</div>
						<Avatar src={currentUser.avatar}/>
						<div className={theme.settings}>
							<SettingsIcon />
						</div>
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

