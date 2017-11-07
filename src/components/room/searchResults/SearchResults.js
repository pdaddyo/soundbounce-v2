/* @flow */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {take} from 'lodash';
import Track from 'components/track/Track';

import theme from './searchResults.css';
import Recommendations from 'components/recommendations/Recommendations';

class SearchResults extends Component {
	static propTypes = {
		roomName: PropTypes.string,
		tracks: PropTypes.array,
		onClickVote: PropTypes.func,
		search: PropTypes.string,
		recommendationSeedTrackIds: PropTypes.array
	};

	render() {
		const {tracks, onClickVote, search, recommendationSeedTrackIds, roomName} = this.props;
		return (
			<div className={theme.container}>
				{!search && (
					<Recommendations onClickVote={onClickVote}
									 title={`Recommended tracks '${roomName}'`}
									 seedTrackIds={recommendationSeedTrackIds}/>
				)}
				{
					tracks.map((track, index) => (
						<div className={theme.trackContainer}
							 key={track.id}>
							<Track
								track={{...track, votes: []}}
								onClickVote={onClickVote}
								size='small'/>
						</div>
					))
				}
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	const recommendationSeedTrackIds = take(state.room.playlist, 5).map(t => t.id);
	if (state.ui['inRoomSearch'] && state.spotify.searchResults[state.ui['inRoomSearch']]) {
		return {
			search: state.ui['inRoomSearch'],
			tracks: state.spotify.searchResults[state.ui['inRoomSearch']].tracks['items'].map(track => {
				const playlistEntry = state.room.playlist.find(i => i.id === track.id);
				return {
					...track,
					canVote: !playlistEntry ||
					(playlistEntry && !playlistEntry.votes
						.find(v => v.userId === state.users.currentUserId))
				};
			}),
			recommendationSeedTrackIds,
			roomName: state.room.name
		};
	}
	return {
		tracks: [], search: state.ui['inRoomSearch'],
		recommendationSeedTrackIds,
		roomName: state.room.name
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
