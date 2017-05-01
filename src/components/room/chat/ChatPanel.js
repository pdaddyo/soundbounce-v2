/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component, PropTypes} from 'react';
import {ROOM_CHAT} from 'redux/modules/shared/room';
import TextInput from 'components/ui/textInput/TextInput';
import ArrowRight from '../../svg/icons/ArrowRight';
import ChatBubble from './ChatBubble.js';

import theme from './chatPanel.css';

export default class ChatPanel extends Component {
	static propTypes = {
		onChatSend: PropTypes.func,
		actionLog: PropTypes.array
	};

	chatEnterPressed = () => {
		this.props.onChatSend();
	};

	componentDidMount() {
		this.scrollLastChatIntoView();
	}

	scrollLastChatIntoView() {
		const {actionLog} = this.props;
		if (actionLog.length > 0) {
			const lastChatElement = this.refs[`chat-${actionLog[actionLog.length - 1].id}`];
			if (lastChatElement) {
				lastChatElement.scrollIntoView();
			}
		}
	}

	componentDidUpdate(prevProps) {
		const {scroll} = this.refs;
		// if we've just loaded from having no actionLog,
		if (prevProps.actionLog.length === 0 ||
			// or we're near the bottom already
			(scroll.scrollTop + 150 >= (scroll.scrollHeight - scroll.offsetHeight))) {
			this.scrollLastChatIntoView();
		}
	}

	render() {
		const {actionLog} = this.props;
		return (
			<div className={theme.panel}>
				<div className={theme.chatScroll} ref='scroll'>
					<div className={theme.actionLog}>
						{actionLog.map((loggedAction) => {
							if (loggedAction.type === ROOM_CHAT) {
								return (
									<div key={loggedAction.id}>
										<ChatBubble chat={loggedAction}/>
										<div ref={`chat-${loggedAction.id}`}/>
									</div>
								);
							}
						})}
					</div>
				</div>
				<div className={theme.chatBox}>
					<TextInput uiKey='roomChat'
							   className={theme.input}
							   placeholder='Type message'
							   onEnterPressed={this.chatEnterPressed}/>
					<div className={theme.sendIcon} onClick={this.chatEnterPressed}>
						<ArrowRight/>
					</div>
				</div>
			</div>
		);
	}
}

