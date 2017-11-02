import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import theme from './about.css';
import {
	spotifyAudioAnalysisRequest
} from '../../../redux/modules/spotify';
import MusicBlocks3D from '../../3d/MusicBlocks3D';

class About extends Component {
	static propTypes = {
		room: PropTypes.object,
		currentUser: PropTypes.object,
		player: PropTypes.object,
		analysis: PropTypes.object,
		nowPlayingTrackId: PropTypes.string,
		fetchAnalysis: PropTypes.func
	};

	componentDidMount() {
		const {nowPlayingTrackId} = this.props;
		if (nowPlayingTrackId) {
			this.fetchAnalysisCheck(nowPlayingTrackId);
		}
	}

	componentDidUpdate(prevProps) {
		const {nowPlayingTrackId} = this.props;
		if (nowPlayingTrackId && nowPlayingTrackId !== prevProps.nowPlayingTrackId) {
			this.fetchAnalysisCheck(nowPlayingTrackId);
		}
	}

	fetchAnalysisCheck(trackId) {
		const {fetchAnalysis, analysis} = this.props;
		if (!analysis) {
			fetchAnalysis(trackId);
		}
	}

	render() {
		const {player, analysis} = this.props;
		// const isOwner = currentUser.id === room.creatorId;
		return (
			<div className={theme.about}>
				{analysis && (
					<MusicBlocks3D width={450}
								   height={400}
								   analysis={analysis}
								   player={player}/>
				)}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	const {spotify} = state;
	const nowPlayingTrackId = spotify.player.is_playing ? spotify.player.item.id : null;

	return {
		nowPlayingTrackId,
		track: nowPlayingTrackId ? spotify.tracks[nowPlayingTrackId] : null,
		analysis: nowPlayingTrackId ? spotify.audioAnalysis[nowPlayingTrackId] : null,
		features: nowPlayingTrackId ? spotify.audioFeatures[nowPlayingTrackId] : null,
		player: spotify.player
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	fetchAnalysis: (trackId) => {
		dispatch(spotifyAudioAnalysisRequest(trackId));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(About);

