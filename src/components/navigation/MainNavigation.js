import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {selectCurrentUser} from 'redux/modules/users';
import {spotifyDevicesRequest} from 'redux/modules/spotify';
import Avatar from 'components/user/avatar/Avatar';
import {Link} from 'react-router';
import HelpIcon from 'components/svg/icons/Help';
import DeviceIcon from 'components/svg/icons/Device';

import theme from './mainNavigation.css';
import SoundbounceLogo from '../svg/icons/SoundbounceLogo';
import {uiUpdate} from '../../redux/modules/ui';
import DeviceList from '../devices/DeviceList';

class MainNavigation extends Component {
	static propTypes = {
		currentUser: PropTypes.object,
		player: PropTypes.object,
		isSynced: PropTypes.bool,
		spotifyDevicesRequest: PropTypes.func,
		showDeviceList: PropTypes.func,
		deviceListVisible: PropTypes.bool
	};

	clickDevicesIcon = evt => {
		const {spotifyDevicesRequest, showDeviceList} = this.props;
		// update device list from api
		spotifyDevicesRequest();
		// show menu
		showDeviceList(true);
		document.addEventListener('click', this.hideDevicesList);
	};

	hideDevicesList = evt => {
		const {showDeviceList} = this.props;
		showDeviceList(false);
		document.removeEventListener('click', this.hideDevicesList);
	};

	render() {
		const {currentUser, isSynced, deviceListVisible} = this.props;
		return (
			<div>
				<div className={theme.nav}>
					<Link to='/home'>
						<div className={theme.soundbounce}>
							<SoundbounceLogo isSynced={isSynced}/>
						</div>
					</Link>
					<div className={theme.deviceIconContainer} onClick={this.clickDevicesIcon}>
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
				{deviceListVisible && <DeviceList/>}
			</div>
		);
	}
}

// map the spotify player state to prop 'player'
const mapStateToProps = state => ({
	currentUser: selectCurrentUser(state),
	isSynced: state.sync.isSynced,
	deviceListVisible: Boolean(state.ui['deviceListVisible'])
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	spotifyDevicesRequest: () => {
		dispatch(spotifyDevicesRequest());
	},
	showDeviceList: (visible) => {
		dispatch(uiUpdate({
			key: 'deviceListVisible',
			newState: visible
		}));
	}
});
export default connect(mapStateToProps, mapDispatchToProps)(MainNavigation);

