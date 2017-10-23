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
import {XYFrame} from 'semiotic';
import {curveMonotoneX} from 'd3-shape';
import minBy from 'lodash/minBy';
import chunk from 'lodash/chunk';
import meanBy from 'lodash/meanBy';

import theme from './analysis.css';

const width = 410;
const height = 80;
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
			return <div></div>;
		}

		// split analyis segments into around 100 chunks for our graph
		const chunkedSegments = chunk(analysis.segments,
			Math.floor(analysis.segments.length / 100)
		);

		// for each chunk, work out the mean (avg) loudness
		const segments = chunkedSegments.map(chunk => ({
			loudness: meanBy(chunk, 'loudness_max'),
			start: chunk[0].start
		}));

		const peakLoudness = minBy(segments, 'loudness').loudness;

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

		let progressIndicator = null;
		if (progressPercent > 0) {
			const xPos = progressPercent / 100 * width;

			progressIndicator = <line x1={xPos} y1="0" x2={xPos} y2={height}
									  style={{stroke: 'rgba(255,255,255,0.8)', strokeWidth: 2}}/>;
		}
		return (
			<div>
				<XYFrame
					size={[width, height]}
					lines={[
						{
							id: 'loudness',
							color: '#FA0B84',
							data: segments.map(s => ({
								start: s.start,
								loudness: peakLoudness - s.loudness
							}))
						},
						{
							id: 'loudnessNeg', color: '#00BFFF',
							data: segments.map(s => ({
								start: s.start,
								loudness: -peakLoudness + s.loudness
							}))
						}
					]}
					lineDataAccessor={'data'}
					lineStyle={d => d.id === 'loudnessNeg' ? ({
						fill: '#00BFFF',
						fillOpacity: 0.7,
						stroke: '#FA0B84',
						strokeWidth: '2px'
					}) : {}}

					lineType={{type: 'difference', interpolator: curveMonotoneX}}
					xAccessor={'start'}
					yAccessor={'loudness'}
					foregroundGraphics={progressIndicator}
				/>
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
