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
/* eslint-enable */

class MusicBubble extends Component {
	static propTypes = {
		loggedAction: PropTypes.object.isRequired,
		tracks: PropTypes.array,
		showMoreTracks: PropTypes.func,
		hideMoreTracks: PropTypes.func,
		moreTracksVisible: PropTypes.bool
	};

	render() {
		const {
			loggedAction, tracks,
			showMoreTracks, hideMoreTracks, moreTracksVisible
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
			? `And ${tracks.length - 1} more track${tracks.length === 2 ? '' : 's'}` : '';

		const showLess = tracks.length > 1
			? 'Show less' : '';

		return (
			<div className={userTheme('container')}>
				<div className={userTheme('musicBubble')}>
					<div className={theme.trackGroup}>

						{!moreTracksVisible && (
							<div className={theme.trackContainer}>
								<Track track={firstTrack} size='small'/>
								<div className={theme.andMore}
									 onClick={() => {
										 showMoreTracks(firstTrack.id);
									 }}>
									{andMore}
								</div>
							</div>
						)}

						{moreTracksVisible && (
							<div className={theme.trackContainer}>
								{tracks.map(track =>
									<Track track={track} size='small'/>
								)}
								<div className={theme.andMore}
									 onClick={() => {
										 hideMoreTracks(firstTrack.id);
									 }}>
									{showLess}
								</div>
							</div>
						)}
					</div>
				</div>
				<div className={userTheme('timestamp')}>
					Added
					{sentByCurrentUser ? ' ' : ` by ${loggedAction.user.nickname} • `}
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
		.filter(p => p.showInChat)
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
		moreTracksVisible: state.ui[`music-bubble-expand-${tracks[0].id}`]
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	showMoreTracks: (firstTrackId) => {
		dispatch(uiUpdate({
			key: `music-bubble-expand-${firstTrackId}`, newState: true
		}));
	},
	hideMoreTracks: (firstTrackId) => {
		dispatch(uiUpdate({
			key: `music-bubble-expand-${firstTrackId}`, newState: false
		}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(MusicBubble);

