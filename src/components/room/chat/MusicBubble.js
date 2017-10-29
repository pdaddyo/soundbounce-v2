/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';

import PropTypes from 'prop-types';
import moment from 'moment';
import Avatar from '../../user/avatar/Avatar';

import theme from './bubbles.css';
import Track from '../../track/Track';
/* eslint-disable */
import {chain, value, uniq, flatten} from 'lodash';
import {uiUpdate} from '../../../redux/modules/ui';
import EmojiWrapper from './EmojiWrapper';
import emojifyWithOptions from './emojifyWithOptions';
/* eslint-enable */

class MusicBubble extends Component {
	static propTypes = {
		loggedAction: PropTypes.object.isRequired,
		tracks: PropTypes.array,
		showMoreTracks: PropTypes.func,
		onClickEmojiAnimation: PropTypes.func,
		hideMoreTracks: PropTypes.func,
		moreTracksVisible: PropTypes.bool
	};

	render() {
		const {
			loggedAction, tracks,
			showMoreTracks, hideMoreTracks, moreTracksVisible,
			onClickEmojiAnimation
		} = this.props;
		const {sentByCurrentUser} = loggedAction;

		if (!loggedAction || loggedAction['text'] === null) {
			return null;
		}
		const userTheme = (className) =>
			theme[sentByCurrentUser ? className : className + 'OtherUser'];

		let friendlyTimeStamp = moment(loggedAction.timestamp).fromNow();

		if (friendlyTimeStamp.indexOf('seconds') > -1) {
			friendlyTimeStamp = 'Just now';
		}

		const firstTrack = tracks[0];
		const andMore = tracks.length > 1
			? `and ${tracks.length - 1} more track${tracks.length === 2 ? '' : 's'}...` : '';

		const showLess = tracks.length > 1
			? 'show fewer' : '';

		const emoji = loggedAction.payloads[0].emoji;

		return (
			<div className={userTheme('container')}>
				<div className={userTheme('musicBubble')}>
					<div className={emoji ? theme.trackGroupEmoji : theme.trackGroup}>
						{!moreTracksVisible && (
							<div className={theme.trackContainer}>
								<Track track={firstTrack}
									   size='small'/>
								{andMore && (
									<div className={theme.andMore}
										 onClick={() => {
											 showMoreTracks(loggedAction.id);
										 }}>
										{andMore}
									</div>
								)}
							</div>
						)}
						{moreTracksVisible && (
							<div className={theme.tracksContainer}>
								{tracks.map(track =>
									<div className={theme.trackContainer}
										 key={track.id}>
										<Track track={track}
											   size='small'/>
									</div>
								)}
								{andMore && (
									<div className={theme.andMore}
										 onClick={() => {
											 hideMoreTracks(loggedAction.id);
										 }}>
										{showLess}
									</div>
								)}
							</div>
						)}

						{emoji && (
							<div className={theme.reactionEmoji}>
								<EmojiWrapper canClick={sentByCurrentUser}
											  onClickEmojiAnimation={onClickEmojiAnimation}
											  emojiId={loggedAction.payloads[0].id}
								>{emojifyWithOptions(loggedAction.payloads[0].emoji)}</EmojiWrapper>
							</div>
						)}
					</div>
				</div>
				<div className={userTheme('timestamp')}>
					{emoji ? 'Reaction' : 'Added'}
					{sentByCurrentUser ? ' ' : ` ${emoji ? 'from' : 'by'} ${loggedAction.user.nickname} `}
					{friendlyTimeStamp}
				</div>
				{loggedAction.user && (
					<div className={userTheme('avatar')}>
						<Avatar user={loggedAction.user}/>
					</div>
				)}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	const tracks = chain(ownProps.loggedAction.payloads)
		.map(p => p.trackIds)
		.flatten()
		.uniq()
		.map(trackId => ({
			...state.spotify.tracks[trackId]
			// ...state.room.playlist.find(playlistTrack => playlistTrack.id === trackId)
		}))
		.value();

	return {
		tracks,
		moreTracksVisible: tracks.length === 0
			? false : state.ui[`music-bubble-expand-${ownProps.loggedAction.id}`]
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	showMoreTracks: (actionId) => {
		dispatch(uiUpdate({
			key: `music-bubble-expand-${actionId}`, newState: true
		}));
	},
	hideMoreTracks: (actionId) => {
		dispatch(uiUpdate({
			key: `music-bubble-expand-${actionId}`, newState: false
		}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(MusicBubble);

