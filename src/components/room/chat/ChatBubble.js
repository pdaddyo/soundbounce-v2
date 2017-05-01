/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component, PropTypes} from 'react';

import theme from './chatBubble.css';
import Avatar from '../../user/avatar/Avatar';

export default class ChatBubble extends Component {
	static propTypes = {
		chat: PropTypes.object.isRequired
	};

	render() {
		const {chat} = this.props;
		const {sentByCurrentUser} = chat;

		const userTheme = (className) =>
			theme[sentByCurrentUser ? className : className + 'OtherUser'];

		return (
			<div className={userTheme('container')}>
				<div className={userTheme('bubble')}>
					{chat.payloads.map((chat, index) => (
						<div className={theme.text} key={index}>{chat.text}</div>
					))}
				</div>
				<div className={userTheme('avatar')}>
					<Avatar user={chat.user}/>
				</div>
			</div>
		);
	}
}
