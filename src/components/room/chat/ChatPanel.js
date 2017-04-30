/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import {ROOM_CHAT} from 'redux/modules/shared/room';

import TextInput from 'components/ui/textInput/TextInput';

import theme from './chatPanel.css';
import ArrowRight from '../../svg/icons/ArrowRight';

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
				<div className={theme.chatBox}>
					<TextInput uiKey='roomChat'
							   className={theme.input}
							   placeholder='Type message'
							   onEnterPressed={this.chatEnterPressed}/>
					<div className={theme.sendIcon}>
						<ArrowRight/>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	chats: state.room.actionLog.filter(al => al.type === ROOM_CHAT)
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChatPanel);

