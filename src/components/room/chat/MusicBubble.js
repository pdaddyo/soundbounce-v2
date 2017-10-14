/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';

import PropTypes from 'prop-types';
import moment from 'moment';
import Avatar from '../../user/avatar/Avatar';

import theme from './bubbles.css';

class MusicBubble extends Component {
	static propTypes = {
		loggedAction: PropTypes.object.isRequired,
		spotify: PropTypes.object
	};

	render() {
		const {loggedAction, spotify} = this.props;
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

		let totalTracksAddedInThisMessage = 0;
		return (
			<div className={userTheme('container')}>
				<div className={userTheme('bubble')}>
					{loggedAction.payloads.map((action, index) => {
							const firstTrack = spotify.tracks[action.trackIds[0]];
							const andMore = action.trackIds.length > 1 ?
								` and ${action.trackIds.length} more` : '';
							totalTracksAddedInThisMessage += action.trackIds.length;

							return (
								<div>
									<div className={theme.albumArt}
										 style={{backgroundImage: `url(${firstTrack.albumArt})`}}
									/>
									<div className={theme.text} key={index}>
										{firstTrack.name}
										{andMore}
									</div>
								</div>
							)
						}
					)}
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

const mapStateToProps = state => ({
	spotify: state.spotify
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MusicBubble);

