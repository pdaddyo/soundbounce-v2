/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {linkUnfurlingRequestStart, linkUnfurlingToggleHide} from '../../../redux/modules/unfurling';
import Linkify from 'react-linkify';
import every from 'lodash/every';
import PropTypes from 'prop-types';
import moment from 'moment';
import Avatar from '../../user/avatar/Avatar';

import theme from './bubbles.css';
import {spotifyPreviewTrack} from '../../../redux/modules/spotify';
import {syncStart} from '../../../redux/modules/sync';
import {ContextMenuTrigger} from 'react-contextmenu';
import EmojiWrapper from './EmojiWrapper';
import emojifyWithOptions from './emojifyWithOptions';

const maxEmojiToDrawLarge = 5;
const largeEmojiSize = 32;
const maxDescriptionLength = 250;

/*eslint-disable */
const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
/*eslint-enable */

class ChatBubble extends Component {
	static propTypes = {
		chat: PropTypes.object.isRequired,
		linkUnfurlingRequestStart: PropTypes.func,
		onClickEmojiAnimation: PropTypes.func,
		toggleUnfurl: PropTypes.func,
		unfurling: PropTypes.object,
		previewStart: PropTypes.func,
		previewStop: PropTypes.func
	};

	emojify(text, chatId) {
		const {onClickEmojiAnimation, chat} = this.props;
		let emojifiedText = emojifyWithOptions(text, 24);
		// check if this is just emojis with no other text
		if (Array.isArray(emojifiedText) &&
			emojifiedText.length <= maxEmojiToDrawLarge &&
			every(emojifiedText, item => typeof item !== 'string' || item.trim() === '')) {
			// we have just emoji here, so render it bigger!
			emojifiedText = emojifyWithOptions(text, largeEmojiSize);
		}

		// we have emojified text, now wrap for interactive animations when clicked
		const wrapItemIfEmoji = (item, index) => {
			if (typeof item === 'string') {
				return item;
			}
			return <EmojiWrapper key={index}
								 emojiId={`${chatId}-${index}`}
								 canClick={chat.sentByCurrentUser}
								 onClickEmojiAnimation={onClickEmojiAnimation}>{item}</EmojiWrapper>;
		};

		if (typeof emojifiedText !== 'string') {
			// this has emoji in it
			if (Array.isArray(emojifiedText)) {
				return emojifiedText.map((i, index) => wrapItemIfEmoji(i, index));
			} else {
				return wrapItemIfEmoji(emojifiedText);
			}
		}

		return emojifiedText;
	}

	emojifyAndReplaceSlashCommands = (text, chatId) => {
		const content = this.emojify(text, chatId);

		const updateStringIfRequired = str => {
			if (typeof str !== 'string') {
				return str; // not a string (emoji probably)
			}
			if (str.indexOf('/me ') === 0) {
				return <span className={theme.slashMe} key={str}>{str.substr(4)}</span>;
			}
			if (str === '/shrug') {
				return '¯\\_(ツ)_/¯';
			}
			// look for backquote (code)
			const matches = str.match(/`(.*?)`/g);
			if (matches) {
				const startPos = str.indexOf(matches[0]);
				return [
					str.substr(0, startPos),
					// wrap backquoted 'code' in our span
					<span className={theme.code}>
						{str.substr(startPos + 1, matches[0].length - 2)}
						</span>,
					str.substr(startPos + matches[0].length)
				];
			}

			return str;
		};

		if (typeof content !== 'string') {
			if (Array.isArray(content)) {
				return content.map((i, index) => updateStringIfRequired(i));
			} else {
				return updateStringIfRequired(content);
			}
		}

		return updateStringIfRequired(content);
	};

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
		const {unfurling, toggleUnfurl, chat} = this.props;
		const returnArray = [];
		if (matches) {
			for (let url of matches) {
				if (url) {
					if (unfurling.urls[url] && unfurling.urls[url].json) {
						// we have json data for this unfurl
						let {json, hidden} = unfurling.urls[url];

						// hide robin's links by default
						if (chat && chat.user.nickname === 'Robin Rylander') {
							hidden = true;
						}

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

							const unsafeHtmlContent = (
								<div className={theme.unfurlHtml}
									 dangerouslySetInnerHTML={
										 {
											 __html: json['html']
										 }
									 }/>
							);

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
											{title === url ? (
												<span style={{fontStyle: 'italic'}}>
													Preview
												</span>
											) : title}
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
													<a href={url}
													   target='_blank'>
														<img className={theme.unfurlThumbnail}
															 src={thumbnailSrc}/>
													</a>
												</div>
											)}
											{description && (
												<div className={theme.unfurlDescription}
													 title={description}>
													{description.substr(0, maxDescriptionLength)}
													{description.length > maxDescriptionLength ? '...' : ''}
												</div>
											)}
										</div>

									)}

									{(showHtml && !hidden) && (
										title === url ? (
											// wrap content in link if there's no title (since it's likely a plain image)
											<a href={url}
											   target='_blank'>
												{unsafeHtmlContent}
											</a>
										) : unsafeHtmlContent
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
		// ignore right click
		if (evt.button && evt.button === 2) {
			return;
		}
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

		const timeStamp = (
			<div className={userTheme('timestamp')}
				 title={track &&
				 `${track.name}
by ${track.artists && track.artists.map(artist => artist.name).join(', ')}`}
				 onMouseDown={this.previewMouseDown}>
				{sentByCurrentUser ? '' : `${chat.user.nickname} • `}
				{friendlyTimeStamp}
			</div>);
		return (
			<div className={userTheme('container')}>
				<div className={userTheme('bubble')}>
					{chat.payloads.map((chat, index) => (
						<div className={theme.text} key={index}>
							<Linkify properties={{target: '_blank'}}>
								{this.emojifyAndReplaceSlashCommands(chat.text.trim(), chat.id)}
							</Linkify>
							{this.getUnfurledLinks(chat.text.trim())}
						</div>
					))}
				</div>
				{track ? (
					// allow right click if we have a track associated
					<ContextMenuTrigger id='track'
										track={track}
										trackId={track.id}
										collect={c => c}
										holdToDisplay={-1}>
						{timeStamp}
					</ContextMenuTrigger>
				) : timeStamp}

				<div className={userTheme('avatar')}>
					{chat.user && <Avatar user={chat.user}/>}
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

