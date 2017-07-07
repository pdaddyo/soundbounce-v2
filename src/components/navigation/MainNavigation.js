import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {selectCurrentUser} from 'redux/modules/users';
import Avatar from 'components/user/avatar/Avatar';
import {Link} from 'react-router';
import HelpIcon from 'components/svg/icons/Help';
import DeviceIcon from 'components/svg/icons/Device';

import theme from './mainNavigation.css';
import SoundbounceLogo from '../svg/icons/SoundbounceLogo';

class MainNavigation extends Component {
	static propTypes = {
		currentUser: PropTypes.object,
		player: PropTypes.object,
		isSynced: PropTypes.bool
	};

	render() {
		const {currentUser, isSynced} = this.props;
		return (
			<div className={theme.nav}>
				<Link to='/home'>
					<div className={theme.soundbounce}>
						<SoundbounceLogo isSynced={isSynced}/>
					</div>
				</Link>
				<div className={theme.deviceIconContainer}>
					<DeviceIcon />
				</div>
				<Link to='/help'>
					<div className={theme.helpContainer}>
						<HelpIcon />
					</div>
				</Link>
				<Link to='/profile'>
					<div className={theme.avatarContainer}>
						<Avatar user={currentUser}/>
					</div>
				</Link>
			</div>
		);
	}
}

// map the spotify player state to prop 'player'
const mapStateToProps = state => ({
	currentUser: selectCurrentUser(state),
	isSynced: state.sync.isSynced
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MainNavigation);

