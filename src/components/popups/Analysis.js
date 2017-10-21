/**
 * Created by paulbarrass on 21/10/2017.
 */
import React, {Component, PropTypes} from 'react';
import Popup from 'react-popup';
import {spotifyAudioAnalysisRequest} from '../../redux/modules/spotify';
import {connect} from 'react-redux';
import {XYFrame} from 'semiotic';
import {curveMonotoneX} from 'd3-shape';
import minBy from 'lodash/minBy';

class Analysis extends Component {
	static propTypes = {
		track: PropTypes.object,
		analysis: PropTypes.object,
		features: PropTypes.object,
		fetchAnalysis: PropTypes.func
	};

	componentDidMount() {
		if (!this.props.analysis) {
			this.props.fetchAnalysis();
		}
	}

	render() {
		const {analysis} = this.props;
		if (!analysis) {
			return <div></div>;
		}

		const segments = analysis.segments.filter((item, index) =>
			(index % (Math.floor(analysis.segments.length / 70)) === 1)
		);
		const peakLoudness = minBy(segments, 'loudness_start').loudness_start;

		return (
			<div>
				<XYFrame
					size={[410, 150]}
					lines={[
						{
							id: 'loudness',
							color: '#FA0B84',
							data: segments.map(s => ({
								start: s.start,
								loudness_start: peakLoudness - s.loudness_start
							}))
						},
						{
							id: 'loudnessNeg', color: '#00BFFF',
							data: segments.map(s => ({
								start: s.start,
								loudness_start: -peakLoudness + s.loudness_start
							}))
						}
					]}
					lineRenderMode={() => 'sketchy'}
					lineDataAccessor={'data'}
					lineStyle={d => d.id === 'loudnessNeg' ? ({
						fill: '#00BFFF',
						fillOpacity: 0.2,
						stroke: '#FA0B84',
						strokeWidth: '1px'
					}) : {}}

					lineType={{type: 'difference', interpolator: curveMonotoneX}}
					xAccessor={'start'}
					yAccessor={'loudness_start'}
				/>
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	analysis: state.spotify.audioAnalysis[ownProps.track.id],
	features: state.spotify.audioFeatures[ownProps.track.id]
});

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
