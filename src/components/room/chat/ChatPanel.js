/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {ROOM_CHAT} from 'redux/modules/shared/room';
import TextInput from 'components/ui/textInput/TextInput';
import ArrowRight from '../../svg/icons/ArrowRight';
import ChatBubble from './ChatBubble.js';

import theme from './chatPanel.css';

class ChatPanel extends Component {
	static propTypes = {
		onChatSend: PropTypes.func,
		chats: PropTypes.array // from redux connect
	};

	chatEnterPressed = (text) => {
		this.props.onChatSend(text);
	};

	componentDidMount() {
		this.scrollLastChatIntoView();
	}

	scrollLastChatIntoView() {
		const {chats} = this.props;
		if (chats.length > 0) {
			const lastChatElement = this.refs[`chat-${chats[chats.length - 1].id}`];
			if (lastChatElement) {
				lastChatElement.scrollIntoView();
			}
		}
	}

	componentDidUpdate(prevProps) {
		const {scroll} = this.refs;
		// if we've just loaded from having no chats,
		if (prevProps.chats.length === 0 ||
			// or we're near the bottom already
			(scroll.scrollTop + 150 >= (scroll.scrollHeight - scroll.offsetHeight))) {
			this.scrollLastChatIntoView();
		}
	}

	render() {
		const {chats} = this.props;
		return (
			<div className={theme.panel}>
				<div className={theme.chatScroll} ref='scroll'>
					<div className={theme.chats}>
						{chats.map((chat, index) => (
							<div ref={`chat-${chat.id}`} key={chat.id}>
								<ChatBubble chat={chat}/>
							</div>
						))}
					</div>
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
		.map(chatWithUserId => ({
			...chatWithUserId,
			user: state.users.users[chatWithUserId.payload.userId]
		}))
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChatPanel);

