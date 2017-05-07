/* @flow */
import React, {Component, PropType} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {socketEmitRoomCreate, socketRequestHomeData} from 'redux/modules/socket';
import {selectCurrentUser} from 'redux/modules/users';

import TopBar from 'components/home/homeTopBar/HomeTopBar';

import theme from './homeView.css';

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
		const color = prompt('Enter your color', '#ad009f');

		createRoom({
			name: roomName,
			config: {
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

		const Room = ({name, track, colors}) => (
			<div className={theme.room}>
				<div className={theme.albumArt} style={{backgroundImage: track.albumArt}}>
				</div>
				<div className={theme.name} style={{borderBottomColor: colors.primary}}>
					{name}
				</div>
			</div>
		);

		return (
			<div className={theme.container}>
				<TopBar/>
				<div className={theme.home}>
					{activeRooms.map(room => (
						<Room name={room.name} track={room.nowPlaying} colors={room.config.colors}/>
					))}
					{popularRooms.map(room => (
						<Room name={room.name} track={room.nowPlaying} colors={room.config.colors}/>
					))}
					<br/>
					<button onClick={this.clickCreateRoom}>Create new room</button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	currentUser: selectCurrentUser(state),
	home: state.home
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
