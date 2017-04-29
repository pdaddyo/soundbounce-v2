/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import {ROOM_CHAT} from 'redux/modules/shared/room';

import TextInput from 'components/ui/textInput/TextInput';

import theme from './chatPanel.css';

class ChatPanel extends Component {
	static propTypes = {
		onChatSend: PropTypes.func,
		chats: PropTypes.array // from redux connect
	};

	chatEnterPressed = (text) => {
		this.props.onChatSend(text);
	};

	render() {
		const {chats} = this.props;
		return (
			<div className={theme.panel}>
				<div className={theme.chats}>
					{chats.map((chat, index) => (
						<div key={index}>{chat.payload.userId}: {chat.payload.text}</div>
					))}
				</div>
				<TextInput uiKey='roomChat' onEnterPressed={this.chatEnterPressed}/>
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	chats: state.room.actionLog.filter(al => al.type === ROOM_CHAT)
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChatPanel);

