/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
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

		let friendlyTimeStamp = moment(chat.timestamp).fromNow();

		if (friendlyTimeStamp.indexOf('seconds') > -1) {
			friendlyTimeStamp = 'Just now';
		}
		return (
			<div className={userTheme('container')}>
				<div className={userTheme('bubble')}>
					{chat.payloads.map((chat, index) => (
						<div className={theme.text} key={index}>{chat.text}</div>
					))}
					<div className={userTheme('timestamp')}>
						{friendlyTimeStamp}
					</div>
				</div>

				<div className={userTheme('avatar')}>
					<Avatar user={chat.user}/>
				</div>
			</div>
		);
	}
}
