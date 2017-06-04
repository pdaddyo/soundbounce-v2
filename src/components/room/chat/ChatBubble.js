/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {linkUnfurlingRequestStart} from '../../../redux/modules/unfurling';

import PropTypes from 'prop-types';
import moment from 'moment';
import theme from './chatBubble.css';
import Avatar from '../../user/avatar/Avatar';
import ReactEmoji from 'react-emoji';

const soloEmojiSize = '30px';
/*eslint-disable */
const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/g;
/*eslint-enable */

class ChatBubble extends Component {
	static propTypes = {
		chat: PropTypes.object.isRequired,
		linkUnfurlingRequestStart: PropTypes.func,
		unfurling: PropTypes.object
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

	componentWillMount() {
		this.makeLinkUnfurlRequests();
	}

	componentDidUpdate() {
		this.makeLinkUnfurlRequests();
	}

	makeLinkUnfurlRequests() {
		const {chat, unfurling, linkUnfurlingRequestStart} = this.props;

		for (let chatMessage of chat.payloads) {
			const matches = chatMessage.text.match(linkRegex);
			if (matches) {
				for (let match of matches) {
					if (match) {
						if (!unfurling.urls[match]) {
							linkUnfurlingRequestStart(match);
						}
					}
				}
			}
		}
	}

	linkify(text) {
		const matches = text.match(linkRegex);
		/*const {unfurling, linkUnfurlingRequestStart} = this.props;
		 if (matches) {

		 }*/
		return text;
	}

	render() {
		const {chat} = this.props;
		const {sentByCurrentUser} = chat;

		if (!chat || chat['text'] === null) {
			return null;
		}
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

							{this.emojify(this.linkify(chat.text.trim()))}

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

const mapStateToProps = state => ({
	unfurling: state.unfurling
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	linkUnfurlingRequestStart: (url) => {
		dispatch(linkUnfurlingRequestStart({url}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(ChatBubble);

