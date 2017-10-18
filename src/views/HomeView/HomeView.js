/* @flow */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {socketEmitRoomCreate, socketRequestHomeData} from 'redux/modules/socket';
import {selectCurrentUser} from 'redux/modules/users';
import defaultRoomConfig from '../../../server/soundbounce/data/defaultRoomConfig';

import TopBar from 'components/home/homeTopBar/HomeTopBar';

import theme from './homeView.css';

const Room = ({room: {name, track, config: {colors}, id}}) => (
	<Link to={`/room/${id}`} key={id}>
		<div className={theme.room}>
			<div className={theme.albumArt}
				 style={{backgroundImage: track ? `url(${track.albumArt})` : null}}>
			</div>
			<div className={theme.name} style={{borderBottomColor: colors.primary}}>
				{name}
			</div>
		</div>
	</Link>
);

class HomeView extends Component {
	static propTypes = {
		createRoom: PropTypes.func.isRequired,
		currentUser: PropTypes.object,
		requestHomeData: PropTypes.func,
		activeRooms: PropTypes.array,
		popularRooms: PropTypes.array
	};

	clickCreateRoom = (evt) => {
		const {createRoom, currentUser} = this.props;
		// todo: better ui here!
		const roomName = prompt('Enter your room name (this will be nice ui later!)',
			`${currentUser.nickname}'s room`);
		if (!roomName) {
			return;
		}
		const color = prompt('Enter your color', '#ad009f');
		createRoom({
			name: roomName,
			config: {
				...defaultRoomConfig,
				colors: {
					primary: color
				}
			}
		});
	};

	componentWillMount() {
		this.props.requestHomeData();
	}

	render() {
		const {activeRooms, popularRooms} = this.props;

		return (
			<div className={theme.container}>
				<TopBar/>
				<button onClick={this.clickCreateRoom}
				className={theme.buttonCreateRoom}>Create new room</button>
				<div className={theme.home}>
					{activeRooms.map(room => (
						<Room room={room} key={room.id}/>
					))}
					{popularRooms.map(room => (
						<Room room={room} key={room.id}/>
					))}
					<br/>

				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	currentUser: selectCurrentUser(state),
	activeRooms: state.home.activeRooms.map(room => ({
		...room,
		track: room.nowPlayingTrackId ? state.spotify.tracks[room.nowPlayingTrackId] : null
	})),
	popularRooms: state.home.popularRooms.map(room => ({
		...room,
		track: room.nowPlayingTrackId ? state.spotify.tracks[room.nowPlayingTrackId] : null
	}))
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	createRoom: (room) => {
		dispatch(socketEmitRoomCreate(room));
	},
	requestHomeData: () => {
		dispatch(socketRequestHomeData());
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
