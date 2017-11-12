/**
 * Created by paulbarrass on 12/11/2017.
 */
import React, {Component, PropTypes} from 'react';
import {XYFrame} from 'semiotic';
import {curveMonotoneX} from 'd3-shape';
import minBy from 'lodash/minBy';
import chunk from 'lodash/chunk';
import meanBy from 'lodash/meanBy';

import Loading from 'components/svg/loading/Loading';
const desiredChunkCount = 100;

export default class Waveform extends Component {
	static propTypes = {
		width: PropTypes.number,
		height: PropTypes.number,
		analysis: PropTypes.object,
		progressPercent: PropTypes.number,
		fill: PropTypes.string,
		stroke: PropTypes.string
	};

	render() {
		const {analysis, progressPercent, width, height, fill, stroke} = this.props;
		if (!analysis) {
			return <div style={{marginBottom: -2, marginTop: -1}}>
				<Loading style={{width: 23, height: 23}}/>
			</div>;
		}

		let chunkSize = Math.floor(analysis.segments.length / desiredChunkCount);
		if (chunkSize < 1) {
			chunkSize = 1;
		}

		// split analysis segments into around 100 chunks for our graph
		const chunkedSegments = chunk(analysis.segments, chunkSize);

		// for each chunk, work out the mean (avg) loudness
		const segments = chunkedSegments.map(chunk => ({
			loudness: meanBy(chunk, 'loudness_max'),
			start: chunk[0].start
		}));

		const peakLoudness = minBy(segments, 'loudness').loudness;

		let progressIndicator = null;
		if (progressPercent > 0) {
			const xPos = progressPercent / 100 * width;

			progressIndicator = <line x1={xPos} y1="0" x2={xPos} y2={height}
									  style={{stroke: 'rgba(255,255,255,0.8)', strokeWidth: 2}}/>;
		}
		return (
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
					fill,
					fillOpacity: 0.7,
					stroke,
					strokeWidth: '1px'
				}) : {}}
				lineType={{type: 'difference', interpolator: curveMonotoneX}}
				xAccessor={'start'}
				yAccessor={'loudness'}
				foregroundGraphics={progressIndicator}
			/>
		);
	}
}
