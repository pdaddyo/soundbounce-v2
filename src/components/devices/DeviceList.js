/**
 * Created by paulbarrass on 07/07/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import theme from './deviceList.css';
import {spotifySwitchDevice} from '../../redux/modules/spotify';

class DeviceList extends Component {
	static propTypes = {
		devices: PropTypes.array.isRequired,
		switchDevice: PropTypes.func
	};

	clickDevice(deviceId) {
		this.props.switchDevice(deviceId);
	}

	render() {
		const {devices} = this.props;
		return (
			<div className={theme.container}>
				{devices.length === 0 && (
					<div className={theme.notFound}>
						<strong>No devices found.</strong><br/><br/>
						Open Spotify app (or web player)
						and ensure Spotify Connect is enabled, and you
						are logged into same Spotify Premium account.
					</div>
				)}
				{devices.map(device => (
					<div className={theme[device.is_active ? 'deviceActive' : 'device']}
						 key={device.id}
						 onClick={this.clickDevice.bind(this, device.id)}>
						{device.name}
					</div>
				))}
			</div>
		);
	}
}

const mapStateToProps = state => ({
	devices: state.spotify.devices
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	switchDevice: deviceId => {
		dispatch(spotifySwitchDevice(deviceId));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(DeviceList);

