/* @flow */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import SpotifyPlayerStatus from 'components/player/SpotifyPlayerStatus';
import {socketEmitRoomCreate} from 'redux/modules/socket';

import classes from './homeView.css';

class HomeView extends Component {
	static propTypes = {
		createRoom: PropTypes.func.isRequired,
		profile: PropTypes.object
	};

	clickCreateRoom = (evt) => {
		const {createRoom, profile} = this.props;

		const roomName = prompt('Enter your room name (this will be nice ui later!)',
			`${profile.display_name}'s room`);

		createRoom({
			name: roomName,
			creator: profile.id
		});
	};

	render() {
		return (
			<div className={classes.container}>
				<SpotifyPlayerStatus />
				<button onClick={this.clickCreateRoom}>Create room</button>
				<br/>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	profile: state.spotify.profile
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	createRoom: (room) => {
		dispatch(socketEmitRoomCreate(room));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
