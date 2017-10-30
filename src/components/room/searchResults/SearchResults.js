/* @flow */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Track from 'components/track/Track';

import theme from './searchResults.css';
class SearchResults extends Component {
	static propTypes = {
		tracks: PropTypes.array,
		onClickVote: PropTypes.func
	};

	render() {
		const {tracks, onClickVote} = this.props;
		return (
			<div className={theme.container}>
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
	if (state.ui['inRoomSearch'] && state.spotify.searchResults[state.ui['inRoomSearch']]) {
		return {
			tracks: state.spotify.searchResults[state.ui['inRoomSearch']].tracks['items'].map(track => {
				const playlistEntry = state.room.playlist.find(i => i.id === track.id);
				return {
					...track,
					canVote: !playlistEntry ||
					(playlistEntry && !playlistEntry.votes
						.find(v => v.userId === state.users.currentUserId))
				};
			})
		};
	}
	return {tracks: []};
};

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
