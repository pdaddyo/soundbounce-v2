import React, {Component, PropTypes} from 'react';
import classes from './browseTrackView.css';
import Recommendations from '../../components/recommendations/Recommendations';
import {
	spotifyAudioAnalysisRequest, spotifyFullAlbumRequest
} from '../../redux/modules/spotify';
import {connect} from 'react-redux';
import Track from '../../components/track/Track';

class BrowseTrackView extends Component {
	static propTypes = {
		params: PropTypes.object,
		albumId: PropTypes.string,
		track: PropTypes.object,
		fullAlbum: PropTypes.object,
		analysis: PropTypes.object,
		features: PropTypes.object,
		onClickVote: PropTypes.func,
		fetchAnalysis: PropTypes.func,
		fetchFullAlbum: PropTypes.func
	};

	fetch = () => {
		const {fetchAnalysis, fetchFullAlbum, fullAlbum, analysis, albumId} = this.props;
		if (!fullAlbum && albumId) {
			fetchFullAlbum(albumId);
		}
		if (!analysis) {
			fetchAnalysis();
		}
	};

	componentDidMount() {
		this.fetch();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.params.trackId !== this.props.params.trackId) {
			// track changed, get new data
			this.fetch();
		}
	}

	render() {
		const {fullAlbum, track, onClickVote} = this.props;
		return (
			<div className={classes.container}>
				<Track size='hero' track={track}/>
				<Recommendations onClickVote={onClickVote}
								 title='Find similar tracks'
								 key={this.props.params.trackId}
								 seedTrackIds={[this.props.params.trackId]}/>
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	/*	const playlist = selectPlaylistTracksAndVotes(state); */
	const trackId = ownProps.params.trackId;

	const track = state.spotify.tracks[trackId];
	let albumId = null;
	if (track && track.json) {
		albumId = track.json.album.id;
	}
	if (track && track.album) {
		albumId = track.album.id;
	}
	return {
		track,
		albumId,
		fullAlbum: albumId && state.spotify.fullAlbums[albumId],
		analysis: state.spotify.audioAnalysis[trackId],
		features: state.spotify.audioFeatures[trackId]
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	fetchAnalysis: () => {
		dispatch(spotifyAudioAnalysisRequest(ownProps.params.trackId));
	},
	fetchFullAlbum: (albumId) => {
		dispatch(spotifyFullAlbumRequest(albumId));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(BrowseTrackView);
