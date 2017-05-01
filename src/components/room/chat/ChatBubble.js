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
		return (
			<div className={theme.container}>
				<div className={theme.bubble}>
					{chat.payloads.map(chat => (
						<div className={theme.text}>{chat.text}</div>
					))}
				</div>
				<div className={theme.avatar}>
					<Avatar user={chat.user}/>
				</div>
			</div>
		);
	}
}
