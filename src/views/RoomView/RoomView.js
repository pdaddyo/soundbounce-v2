/* @flow */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {selectCurrentUser} from 'redux/modules/users';
import {socketEmitRoomEvent, socketEmitRoomJoin} from 'redux/modules/socket';
import ChatPanel from 'components/room/chat/ChatPanel';

import theme from './roomView.css';
import TopBar from 'components/room/roomTopBar/RoomTopBar';
import Dots from '../../components/room/backgrounds/Dots';

class RoomView extends Component {
	static propTypes = {
		emitRoomEvent: PropTypes.func.isRequired,
		emitRoomJoin: PropTypes.func,
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
		const {room, params, emitRoomJoin} = this.props;
		// if we're not in this room but component just mounted, we'd better join it
		if (room.id !== params.roomId) {
			emitRoomJoin();
		}

		// add the drag drop listeners to the document so you can drop anywhere, not just this
		// component.
		document.addEventListener('drop', this.onDrop);
		document.addEventListener('dragover', this.onDragOver);
	}

	componentWillUnmount() {
		document.removeEventListener('drop', this.onDrop);
		document.removeEventListener('dragover', this.onDragOver);
	}

	onChatSend = (text) => {
		this.props.emitRoomEvent({
			type: 'chat',
			text
		});
	};

	render() {
		const {room, params} = this.props;
		if (room.id !== params.roomId) {
			// on mount we emitted a room join, so shouldn't be long now
			return <div className={theme.container}>
				Connecting to room...
			</div>;
		}

		return (
			<div className={theme.container}>
				<Dots />
				<TopBar room={room}/>
				<div className={theme.room}>


				</div>
				<div className={theme.chat}>
					<ChatPanel onChatSend={this.onChatSend}/>
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
	},
	emitRoomJoin: () => {
		dispatch(socketEmitRoomJoin(ownProps.params.roomId));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(RoomView);
