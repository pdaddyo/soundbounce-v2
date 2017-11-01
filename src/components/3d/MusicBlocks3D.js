/**
 * Created by paulbarrass on 01/11/2017.
 */

import React, {Component, PropTypes} from 'react';
import {Mesh, Object3D, PerspectiveCamera, Renderer, Scene} from 'react-three';
import * as THREE from 'three';
import max from 'lodash/max';
import moment from 'moment';

const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const boxMaterial = new THREE.MeshBasicMaterial({});
const yStretch = 20;

export default class MusicBlocks3D extends Component {
	static propTypes = {
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,
		analysis: PropTypes.object.isRequired,
		progressPercent: PropTypes.number,
		serverMsOffset: PropTypes.number,
		nowPlayingStartedAt: PropTypes.number
	};

	constructor(props) {
		super(props);
		this.state = {time: 0};
	}

	animate = () => {
		const {
			serverMsOffset, nowPlayingStartedAt, progressPercent
		} = this.props;
		if (!this.mounted || progressPercent === 0) {
			return;
		}
		this.setState({time: (moment().valueOf() - nowPlayingStartedAt - serverMsOffset) / 1000});
		this.frameId = requestAnimationFrame(this.animate);
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
			width, height, analysis, progressPercent
		} = this.props;

		const yPos = (progressPercent === 0 ? 0 : this.state.time) * yStretch;

		const cameraProps = {
			fov: 75, aspect: width / height,
			near: 1, far: 5000,
			position: new THREE.Vector3(60, yPos, 100),
			lookat: new THREE.Vector3(60, yPos + 55, 0)
		};

		const segmentsToRender = analysis.segments.filter(s => s.confidence > 0.2);
		return (
			<div>
				<Renderer width={width} height={height} enableRapidRender={true}
						  background={0x222222}>
					<Scene width={width} height={height} camera="maincamera">
						<PerspectiveCamera name="maincamera" {...cameraProps} />
						<Mesh geometry={boxGeometry}
							  material={boxMaterial}
							  scale={new THREE.Vector3(200, 0.1, 0.01)}
							  position={new THREE.Vector3(-100, yPos, 0)}
						/>
						{analysis.bars.map(bar => (
							<Mesh geometry={boxGeometry}
								  material={boxMaterial}
								  scale={new THREE.Vector3(12, 0.01, 0.01)}
								  position={new THREE.Vector3(55, bar.start * yStretch, 0)}/>
						))}
						<Object3D>
							{segmentsToRender.map((segment, index) => {
								const mostConfidentPitch = max(segment.pitches);
								const pitchIndex = segment.pitches.indexOf(mostConfidentPitch);
								// const timbreForPitch = segment.timbre[pitchIndex];
								const pitchRelativeToKey = (analysis.track.key + pitchIndex - 1) % 12;
								const yScale = segment.duration * yStretch / 10;
								return <Mesh key={index}
											 geometry={boxGeometry}
											 material={boxMaterial}
											 scale={new THREE.Vector3(
												 0.01 * (30 + segment.loudness_max),
												 yScale,
												 0.1
											 )}
											 position={new THREE.Vector3(
												 pitchRelativeToKey * 10,
												 segment.start * yStretch,
												 0
											 )}
								/>;
							})}

						</Object3D>
					</Scene>
				</Renderer>
			</div>
		);
	}
}
