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

	// this is to make items of same type (vote, chat etc), from same user, in a certain time span
	// group together so we don't have a million chat bubbles when someone (me?) is ranting ;)
	// or 20 tracks are dropped at once etc
	static groupSimilarActionLogItems(actionLog) {
		const groupedActionLog = [];
		for (let actionIndex = 0; actionIndex < actionLog.length; actionIndex++) {
			const action = actionLog[actionIndex];
			const groupedPayloads = [];
			groupedPayloads.push(action.payload); // add this payload

			// now look ahead and see if we should consume future actions, to group together into
			// a single bubble / message
			while (actionIndex + 1 < actionLog.length &&
			actionLog[actionIndex + 1].type === action.type &&
			actionLog[actionIndex + 1].payload.userId === action.payload.userId &&
			((new Date(actionLog[actionIndex + 1].timestamp)).getTime() -
			(new Date(actionLog[actionIndex].timestamp)).getTime()) < 1000 * 120) {
				groupedPayloads.push(actionLog[++actionIndex].payload);
			}

			// ok now we've grouped a bunch of payloads (potentially, we defo have at least one)
			groupedActionLog.push({
				...actionLog[actionIndex],
				payload: null,
				payloads: groupedPayloads
			});
		}
		return groupedActionLog;
	}

	render() {
		const actionLog = ChatPanel.groupSimilarActionLogItems(this.props.actionLog);
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
							// todo: add track, vote, like etc etc
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

