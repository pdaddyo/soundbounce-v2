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
/* eslint-enable */

class MusicBubble extends Component {
	static propTypes = {
		loggedAction: PropTypes.object.isRequired,
		tracks: PropTypes.array
	};

	render() {
		const {loggedAction, tracks} = this.props;
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

		return (
			<div className={userTheme('container')}>
				<div className={userTheme('bubble')}>
					<div className={theme.trackGroup}>

						<div className={theme.trackContainer}>
							<Track track={firstTrack} size='small'/>
							<div className={theme.andMore}>
								{andMore}
							</div>
						</div>

					</div>
				</div>
				<div className={userTheme('timestamp')}>
					Added&nbsp;
					{sentByCurrentUser ? '' : ` by ${loggedAction.user.nickname} • `}
					{friendlyTimeStamp}
				</div>
				<div className={userTheme('avatar')}>
					<Avatar user={loggedAction.user}/>
				</div>
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
		tracks
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MusicBubble);

