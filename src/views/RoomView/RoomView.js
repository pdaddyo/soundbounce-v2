/* @flow */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {selectCurrentUser} from 'redux/modules/users';
import {socketEmitRoomEvent} from 'redux/modules/socket';

import classes from './roomView.css';

class RoomView extends Component {
	static propTypes = {
		emitRoomEvent: PropTypes.func.isRequired,
		currentUser: PropTypes.object,
		params: PropTypes.object,
		room: PropTypes.object
	};

	// try to pull spotify track Ids from drop text
	onDrop = (evt) => {
		if (evt.preventDefault) evt.preventDefault();
		const text = evt.dataTransfer.getData('Text');
		// strip to just the track ids, and remove empties
		const trackIds = text
			.split('\n')
			.map(url => url.substr(url.lastIndexOf('/') + 1))
			.filter(item => item);

		console.log(`addOrVote ${trackIds}`);
		this.props.emitRoomEvent({
			type: 'addOrVote',
			trackIds
		});
	};

	onDragOver = (evt) => {
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy';
	};

	componentWillMount() {
		document.addEventListener('drop', this.onDrop);
		document.addEventListener('dragover', this.onDragOver);
	}

	componentWillUnmount() {
		document.removeEventListener('drop', this.onDrop);
		document.removeEventListener('dragover', this.onDragOver);
	}

	render() {
		const {room, params} = this.props;
		if (room.id !== params.roomId) {
			// todo: negotiate connection to correct room since our url doesn't match state
			return <div>Room id mismatch</div>;
		}

		return (
			<div className={classes.container}>
				<div className={classes.room}>
					<div className={classes.name}>
						{room.name}
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	currentUser: selectCurrentUser(state),
	room: state.room
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	emitRoomEvent: (event) => {
		dispatch(socketEmitRoomEvent({roomId: ownProps.params.roomId, event}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(RoomView);
