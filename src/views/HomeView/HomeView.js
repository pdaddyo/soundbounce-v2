/* @flow */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {socketEmitRoomCreate} from 'redux/modules/socket';
import {selectCurrentUser} from 'redux/modules/users';

import classes from './homeView.css';

class HomeView extends Component {
	static propTypes = {
		createRoom: PropTypes.func.isRequired,
		currentUser: PropTypes.object
	};

	clickCreateRoom = (evt) => {
		const {createRoom, currentUser} = this.props;

		const roomName = prompt('Enter your room name (this will be nice ui later!)',
			`${currentUser.nickname}'s room`);

		createRoom({
			name: roomName
		});
	};

	render() {
		return (
			<div className={classes.container}>
				<button onClick={this.clickCreateRoom}>Create room</button>
				<br/>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	currentUser: selectCurrentUser(state)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	createRoom: (room) => {
		dispatch(socketEmitRoomCreate(room));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
