/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import theme from './chatBubble.css';
import Avatar from '../../user/avatar/Avatar';
import Linkify from 'react-linkify';
import ReactEmoji from 'react-emoji';

const soloEmojiSize = '30px';

export default class ChatBubble extends Component {
	static propTypes = {
		chat: PropTypes.object.isRequired
	};

	emojify(text) {
		const emojifiedText = ReactEmoji.emojify(text);
		// check if this is just an emoji with no other text
		if (Array.isArray(emojifiedText) &&
			emojifiedText.length === 1 &&
			typeof emojifiedText[0] !== 'string') {
			// we have a single emoji here, so render it bigger!
			return ReactEmoji.emojify(text,
				{attributes: {width: soloEmojiSize, height: soloEmojiSize}}
			);
		}
		return emojifiedText;
	}

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
						<div className={theme.text} key={index}>
							<Linkify properties={{target: '_blank'}}>
								{this.emojify(chat.text.trim())}
							</Linkify>
						</div>
					))}
				</div>
				<div className={userTheme('timestamp')}>
					{sentByCurrentUser ? '' : `${chat.user.nickname} • `}
					{friendlyTimeStamp}
				</div>
				<div className={userTheme('avatar')}>
					<Avatar user={chat.user}/>
				</div>
			</div>
		);
	}
}
