/**
 * Created by paulbarrass on 01/11/2017.
 */

import React, {Component, PropTypes} from 'react';
import {Mesh, Object3D, PerspectiveCamera, Renderer, Scene} from 'react-three';
import * as THREE from 'three';
import take from 'lodash/take';
import takeRight from 'lodash/takeRight';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import colors from 'shared/colors';

const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const simpleWhiteMaterial = new THREE.MeshBasicMaterial({});
const yStretch = 20;

export default class MusicBlocks3D extends Component {
	static propTypes = {
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,
		analysis: PropTypes.object.isRequired,
		player: PropTypes.object
	};

	constructor(props) {
		super(props);
		this.state = {time: 0};

		// super basic material cache
		this.materialCache = {};
		this.colorIndex = 4;
		this.getMaterial = (key) => {
			if (this.materialCache[key]) {
				return this.materialCache[key];
			}
			const material = new THREE.MeshBasicMaterial({
				color: parseInt(`0x${colors[this.colorIndex % colors.length].substr(1)}`)
			});
			this.materialCache[key] = material;
			this.colorIndex += 14;
			return material;
		};
	}

	animate = () => {
		const {player} = this.props;
		if (!this.mounted) {
			return;
		}
		this.setState({
			time: player.is_playing
				? (player.progress_ms + (moment().valueOf() - player.updateArrivedAt - 50)) / 1000 : 0
		});
		requestAnimationFrame(this.animate);
	};

	componentDidMount() {
		this.mounted = true;
		this.animate();
		console.log(this.props.analysis);
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	render() {
		const {
			width, height, analysis
		} = this.props;

		const yTrackPosition = this.state.time * yStretch;
		const numRails = 4;

		const cameraProps = {
			fov: 75, aspect: width / height,
			near: 1, far: 5000,
			position: new THREE.Vector3(50, yTrackPosition, 100),
			lookat: new THREE.Vector3(50, yTrackPosition + 55, 0)
		};

		// const segmentsToRender = analysis.segments.filter(s => s.confidence > 0.3);
		const segmentsToRender = takeRight(sortBy(analysis.segments, 'confidence'), 400);
		const segmentMeshes = [];

		const mostRecentSegmentForRailEndPoints = [];

		segmentsToRender.forEach((segment, segmentIndex) => {
			const mostConfidentPitches = take([...segment.pitches].sort(), 3);

			mostConfidentPitches.forEach((pitchConfidence, pitchLoopIndex) => {
				const pitchIndex = segment.pitches.indexOf(pitchConfidence);
				if (pitchLoopIndex > 0 && pitchConfidence < 0.55) {
					return;
				}
				const timbreForPitch = segment.timbre[pitchIndex];
				const yScale = segment.duration * yStretch / 10;
				const segmentWidth = 0.01 + (0.016 * (40 + segment.loudness_max));
				const railForThisSegment = Math.abs((pitchIndex)) % numRails;
				const xPos = (railForThisSegment) * (120 / numRails);
				const yPos = segment.start * yStretch + (yScale * 5);
				mostRecentSegmentForRailEndPoints[railForThisSegment] =
					segmentMeshes.push(
						<Mesh key={segmentIndex + '-' + pitchLoopIndex}
							  geometry={boxGeometry}
							  material={this.getMaterial(`block-style-${Math.floor(timbreForPitch / 15)}`)}
							  scale={new THREE.Vector3(
								  Math.min(segmentWidth, 1) * ((120 / numRails) / 10),
								  yScale,
								  0.1
							  )}
							  position={new THREE.Vector3(xPos, yPos, 0)}
						/>
					);
			});
		});

		return (
			<div>
				<Renderer width={width} height={height} enableRapidRender={true}
						  transparent={true}>
					<Scene width={width} height={height} camera="maincamera">
						<PerspectiveCamera name="maincamera" {...cameraProps} />
						<Mesh geometry={boxGeometry}
							  material={simpleWhiteMaterial}
							  scale={new THREE.Vector3(200, 0.05, 0.01)}
							  position={new THREE.Vector3(-100, yTrackPosition, 0)}
						/>
						{analysis.bars.map(bar => (
							<Mesh geometry={boxGeometry}
								  key={bar.start}
								  material={simpleWhiteMaterial}
								  scale={new THREE.Vector3(12, 0.01, 0.01)}
								  position={new THREE.Vector3(50, bar.start * yStretch, 0)}/>
						))}
						<Object3D>
							{segmentMeshes}

						</Object3D>
					</Scene>
				</Renderer>
			</div>
		);
	}
}
