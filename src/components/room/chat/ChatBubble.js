/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {linkUnfurlingRequestStart, linkUnfurlingToggleHide} from '../../../redux/modules/unfurling';
import Linkify from 'react-linkify';

import PropTypes from 'prop-types';
import moment from 'moment';
import Avatar from '../../user/avatar/Avatar';
import ReactEmoji from 'react-emoji';

import theme from './bubbles.css';
import {spotifyPreviewTrack} from '../../../redux/modules/spotify';
import {syncStart} from '../../../redux/modules/sync';

const soloEmojiSize = '30px';
/*eslint-disable */
const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/g;
/*eslint-enable */

class ChatBubble extends Component {
	static propTypes = {
		chat: PropTypes.object.isRequired,
		linkUnfurlingRequestStart: PropTypes.func,
		toggleUnfurl: PropTypes.func,
		unfurling: PropTypes.object,
		previewStart: PropTypes.func,
		previewStop: PropTypes.func
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

	getUnfurledLinks(text) {
		const matches = text.match(linkRegex);
		const {unfurling, toggleUnfurl} = this.props;
		const returnArray = [];
		if (matches) {
			for (let url of matches) {
				if (url) {
					if (unfurling.urls[url] && unfurling.urls[url].json) {
						// we have json data for this unfurl
						const {json, hidden} = unfurling.urls[url];

						// don't show 'app' html like reddit inline comments or autoplay
						const showHtml = json.html &&
							json.rel.indexOf('autoplay') === -1 &&
							url.indexOf('reddit.com') === -1;

						if (json.meta) {
							const {title = url, description} = json.meta;
							let iconSrc = '', thumbnailSrc = '';
							if (json.links && json.links.icon) {
								iconSrc = json.links.icon[0].href;
							}
							if (json.links && json.links.thumbnail) {
								thumbnailSrc = json.links.thumbnail[0].href;
							}

							returnArray.push(
								<div className={theme.unfurl} key={url}>
									<div className={theme.unfurlTitleArea}>
										{iconSrc && (
											<img className={theme.unfurlIcon}
												 src={iconSrc}
												 onClick={() => toggleUnfurl(url)}
											/>
										)}
										<span><a className={theme.unfurlTitle}
												 href={url}
												 target='_blank'>
											{title}
										</a>
											{!hidden && (
												<span className={theme.showHide}
													  onClick={() => toggleUnfurl(url)}
												>
													 [x]
												</span>
											)}
											{hidden && (
												<span className={theme.showHide}
													  onClick={() => toggleUnfurl(url)}
												>
													 [+]
												</span>
											)}

											</span>

									</div>
									{(description || thumbnailSrc) && !showHtml && !hidden && (
										<div className={theme.unfurlThumbDescription}>
											{thumbnailSrc && (
												<div>
													<img className={theme.unfurlThumbnail}
														 src={thumbnailSrc}/>
												</div>
											)}
											{description && (
												<div className={theme.unfurlDescription}>
													{description}
												</div>
											)}

										</div>

									)}

									{(showHtml && !hidden) && (
										<div className={theme.unfurlHtml}
											 dangerouslySetInnerHTML={
												 {
													 __html: json['html']
												 }
											 }/>
									)}
								</div>
							);
						}
					}
				}
			}
		}
		return returnArray;
	}

	// preview of the track that was playing when this chat was sent
	previewMouseDown = evt => {
		const {chat: {tracks, payloads}} = this.props;
		if (tracks.length < 1) {
			return;
		}
		const {offset} = payloads[0];
		this.props.previewStart(tracks[0].id, offset);
		document.addEventListener('mouseup', this.previewMouseUp);
	};

	previewMouseUp = evt => {
		document.removeEventListener('mouseup', this.previewMouseUp);
		this.props.previewStop();
	};

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

		const track = chat.tracks.length > 0 ? chat.tracks[0] : null;

		return (
			<div className={userTheme('container')}>
				<div className={userTheme('bubble')}>
					{chat.payloads.map((chat, index) => (
						<div className={theme.text} key={index}>
							<Linkify properties={{target: '_blank'}}>
								{this.emojify(chat.text.trim())}
							</Linkify>
							{this.getUnfurledLinks(chat.text.trim())}
						</div>
					))}
				</div>
				<div className={userTheme('timestamp')}
					 title={track &&
					 `${track.name}
${track.artists && track.artists.map(artist => artist.name).join(', ')}`}
					 onMouseDown={this.previewMouseDown}>
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
	},
	toggleUnfurl: (url) => {
		dispatch(linkUnfurlingToggleHide({url}));
	},
	previewStart: (trackId, offset) => {
		dispatch(spotifyPreviewTrack(trackId, offset));
	},
	previewStop: () => {
		dispatch(syncStart());
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(ChatBubble);

