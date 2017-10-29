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
		room: PropTypes.object,
		switchDevice: PropTypes.func,
		spotifyDevicesRequest: PropTypes.func
	};

	static contextTypes = {
		colors: PropTypes.object
	};

	clickDevice(deviceId) {
		this.props.switchDevice(deviceId);
	}

	componentDidMount() {
		this.timerId = setInterval(() => {
			this.props.spotifyDevicesRequest();
		}, 850);
	}

	componentWillUnmount() {
		clearInterval(this.timerId);
	}

	render() {
		const {devices} = this.props;
		const primary = '#00BFFF';
		const activeDevice = devices && devices.find(device => device.is_active);

		return (
			<div>
				{devices.length === 0 || (devices.length > 0 && !activeDevice) && (
					<div className={theme.cover}/>
				)}

				<div className={theme.container}>
					{devices.length === 0 && (
						<div className={theme.notFound}>
							<strong>No Spotify Connect devices found.</strong><br/><br/>
							Open Spotify app (or web player)
							and ensure Spotify Connect is enabled, and you
							are logged into same Spotify account.<br/><br/>
							<span style={{fontSize: '80%'}}>Spotify Premium is required due to
								Spotify Connect being a premium-only feature, sorry!</span>
						</div>
					)}
					{devices.length > 0 && !activeDevice && (
						<div className={theme.notFound}>
							<strong>Select Spotify Connect device.</strong><br/><br/>
							Please select a Spotify Connect device below.<br/><br/>
							<span style={{fontSize: '80%'}}>If your player is not shown,
								try playing a track manually in Spotify first (list refreshes automatically).</span>
						</div>
					)}

					{devices.map(device => (
						<div className={theme[device.is_active ? 'deviceActive' : 'device']}
							 key={device.id}
							 style={device.is_active ? {color: primary} : {}}
							 onClick={this.clickDevice.bind(this, device.id)}>
							{device.name}
						</div>
					))}
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	devices: state.spotify.devices,
	room: state.room
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	switchDevice: deviceId => {
		dispatch(spotifySwitchDevice(deviceId));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(DeviceList);

