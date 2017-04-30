/* @flow */
import React, {Component, PropTypes} from 'react';
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
		home: PropTypes.object
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
		const {home} = this.props;
		return (
			<div className={theme.container}>
				<TopBar/>
				<div className={theme.home}>
					{home.activeRooms.map(room => (
						<div key={room.id}> - <Link to={`/room/${room.id}`}>{room.name}</Link>
							(currently active)
						</div>
					))}
					<hr/>
					{home.popularRooms.map(room => (
						<div key={room.id}> - <Link to={`/room/${room.id}`}>{room.name}</Link></div>
					))}
					<button onClick={this.clickCreateRoom}>Create room</button>
					<br/>
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
