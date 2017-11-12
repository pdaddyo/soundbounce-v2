/**
 * Created by paulbarrass on 21/10/2017.
 */
import React, {Component, PropTypes} from 'react';
import Popup from 'react-popup';
import {
	selectPlaylistTracksAndVotes,
	spotifyAudioAnalysisRequest
} from '../../redux/modules/spotify';
import {connect} from 'react-redux';

import theme from './analysis.css';
import Loading from '../svg/loading/Loading';
import Waveform from '../track/waveform/Waveform';

const width = 410;
const height = 60;

class Analysis extends Component {
	static propTypes = {
		track: PropTypes.object,
		analysis: PropTypes.object,
		features: PropTypes.object,
		fetchAnalysis: PropTypes.func,
		progressPercent: PropTypes.number
	};

	componentDidMount() {
		if (!this.props.analysis) {
			this.props.fetchAnalysis();
		}
	}

	render() {
		const {analysis, features, progressPercent} = this.props;
		if (!analysis) {
			return <div><Loading /></div>;
		}

		const featuresKeys = ['danceability',
							  'energy',
							  'key',
							  'loudness',
							  'speechiness',
							  'acousticness',
							  'instrumentalness',
							  'liveness',
							  'valence',
							  'tempo'];

		return (
			<div>
				<Waveform analysis={analysis}
						  progressPercent={progressPercent}
						  fill='#00BFFF'
						  stroke='#FA0B84'
						  width={width}
						  height={height}/>

				{features && (
					<div className={theme.featuresContainer}>
						{
							featuresKeys.map(key => (
								<div className={theme.features}
									 key={key}>
									<label>{key}</label>
									<span>{features[key]}</span>
								</div>
							))
						}
					</div>
				)}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	const playlist = selectPlaylistTracksAndVotes(state);
	// pass current position in if now playing track
	let progressPercent = -1;
	if (playlist.length > 0 && playlist[0].id === ownProps.track.id) {
		progressPercent = state.room.nowPlayingProgress / playlist[0].duration * 100;
	}
	return {
		analysis: state.spotify.audioAnalysis[ownProps.track.id],
		features: state.spotify.audioFeatures[ownProps.track.id],
		progressPercent
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	fetchAnalysis: () => {
		dispatch(spotifyAudioAnalysisRequest(ownProps.track.id));
	}
});

const ConnectedAnalysis = connect(mapStateToProps, mapDispatchToProps)(Analysis);

Popup.registerPlugin('analysis', function ({
											   track
										   }) {
	this.create({
		title: track.name,
		content: <ConnectedAnalysis track={track}/>,
		buttons: {
			right: ['ok']
		}
	});
});
