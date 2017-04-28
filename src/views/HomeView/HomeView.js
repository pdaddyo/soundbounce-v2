/* @flow */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {socketEmitRoomCreate, socketRequestHomeData} from 'redux/modules/socket';
import {selectCurrentUser} from 'redux/modules/users';

import classes from './homeView.css';

class HomeView extends Component {
	static propTypes = {
		createRoom: PropTypes.func.isRequired,
		currentUser: PropTypes.object,
		requestHomeData: PropTypes.func,
		home: PropTypes.object
	};

	clickCreateRoom = (evt) => {
		const {createRoom, currentUser} = this.props;

		const roomName = prompt('Enter your room name (this will be nice ui later!)',
			`${currentUser.nickname}'s room`);

		createRoom({
			name: roomName
		});
	};

	componentWillMount() {
		this.props.requestHomeData();
	}

	render() {
		const {home} = this.props;
		return (
			<div className={classes.container}>
				{home.activeRooms.map(room => (
					<div key={room.id}> - <Link to={`/room/${room.id}`}>{room.name}</Link></div>
				))}
				<button onClick={this.clickCreateRoom}>Create room</button>
				<br/>
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
