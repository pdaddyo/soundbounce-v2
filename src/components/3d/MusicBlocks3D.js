/**
 * Created by paulbarrass on 01/11/2017.
 */

import React, {Component, PropTypes} from 'react';
import {Mesh, Object3D, PerspectiveCamera, Renderer, Scene} from 'react-three';
import * as THREE from 'expose?THREE!three';
import take from 'lodash/take';
import takeRight from 'lodash/takeRight';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import Proton from 'three.proton.js';

const railColors = ['#FA0B84', '#00BFFF', '#f57c00', '#b2ff59'];
const railKeys = ['h', 'j', 'k', 'l'];
const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const simpleWhiteMaterial = new THREE.MeshBasicMaterial({});
const finishedSegmentMaterials = railColors.map(color => (new THREE.MeshBasicMaterial({
	color: parseInt(`0x${color.substr(1)}`),
	transparent: true,
	opacity: 0.4
})));
const yStretch = 20;
const numRails = 4;
const minGap = 12;

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
		this.clock = new THREE.Clock();

		// super basic material cache
		this.materialCache = {};
		this.colorIndex = 0;
		this.getMaterial = (key) => {
			if (this.materialCache[key]) {
				return this.materialCache[key];
			}
			const material = new THREE.MeshBasicMaterial({
				color: parseInt(`0x${railColors[key % railColors.length].substr(1)}`)
			});
			this.materialCache[key] = material;
			this.colorIndex++;
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

		document.addEventListener('keydown', this.onKeyDown);
		document.addEventListener('keyup', this.onKeyUp);
	}

	componentWillUnmount() {
		this.mounted = false;
		document.removeEventListener('keydown', this.onKeyDown);
		document.removeEventListener('keyup', this.onKeyUp);
	}

	onKeyDown = evt => {
		const railIndex = railKeys.indexOf(evt.key);
		if (railIndex > -1) {
			this.successEmitters[railIndex].emit();
			this.sparkEmitters[railIndex].emit();
		}
	};

	onKeyUp = evt => {
		const railIndex = railKeys.indexOf(evt.key);
		if (railIndex > -1) {
			this.successEmitters[railIndex].stopEmit();
			this.sparkEmitters[railIndex].stopEmit();
		}
	};

	createSprite() {
		const map = new THREE.TextureLoader().load(require('!!file?limit=0!./smokeparticle.png'));
		const material = new THREE.SpriteMaterial({
			map: map,
			color: 0xff0000,
			blending: THREE.AdditiveBlending,
			fog: true
		});
		return new THREE.Sprite(material);
	}

	createEmitter(rail, isFail, isSpark) {
		const emitter = new Proton.Emitter();
		emitter.rate = new Proton.Rate(new Proton.Span(10, 15), new Proton.Span(0.05, 0.1));
		emitter.addInitialize(new Proton.Body(this.createSprite()));
		emitter.addInitialize(new Proton.Mass(isFail ? 1.5 : 1));
		emitter.addInitialize(new Proton.Life(1, 3));
		emitter.addInitialize(new Proton.Position(new Proton.SphereZone(20)));
		if (isSpark) {
			emitter.addInitialize(new Proton.V(new Proton.Span(20, 100), new Proton.Vector3D(0, 1, 0), 30));
		} else {
			emitter.addInitialize(new Proton.V(new Proton.Span(100, 400), new Proton.Vector3D(0, 1, 0), 30));
		}

		emitter.addBehaviour(new Proton.RandomDrift(10, 10, 10, 0.05));
		emitter.addBehaviour(new Proton.Alpha(1, 0.1));
		if (isSpark) {
			emitter.addBehaviour(new Proton.Scale(new Proton.Span(0.5, 0.7), 0));
		} else {
			emitter.addBehaviour(new Proton.Scale(new Proton.Span(isFail ? 1 : 0.5, 1.4), 0));
		}
		emitter.addBehaviour(new Proton.G(9.8));
		emitter.addBehaviour(new Proton.Color(isFail ? '#FF0026' : (isSpark ? '#ffffff' : railColors[rail]),
			['#ffff00', '#ffff11'], Infinity, Proton.easeOutSine));
		emitter.p.x = rail * (120 / numRails);
		emitter.p.y = 0;
		//	emitter.emit();
		return emitter;
	}

	initParticles = scene => {
		// starfield bg
		const geometry = new THREE.Geometry();
		for (let i = 0; i < 3000; i++) {
			const vertex = new THREE.Vector3();
			vertex.x = Math.random() * 2000 - 1000;
			vertex.y = Math.random() * 10000;
			vertex.z = Math.random() * -1000 - 200;
			geometry.vertices.push(vertex);
		}

		this.stars = new THREE.Points(geometry,
			new THREE.PointsMaterial({size: 3, color: 0x00BFFF})
		);
		scene.add(this.stars);

		// this fog makes the notes appear to fade in at top of camera
		// scene.fog = new THREE.Fog(0, 140, 200);

		// physics engine to emit particles
		this.proton = new Proton();
		this.successEmitters = [];
		this.sparkEmitters = [];
		this.failEmitters = [];
		for (let railIndex = 0; railIndex < numRails; railIndex++) {
			this.failEmitters[railIndex] = this.createEmitter(railIndex, true);
			this.successEmitters[railIndex] = this.createEmitter(railIndex);
			this.sparkEmitters[railIndex] = this.createEmitter(railIndex, false, true);
			this.proton.addEmitter(this.failEmitters[railIndex]);
			this.proton.addEmitter(this.successEmitters[railIndex]);
			this.proton.addEmitter(this.sparkEmitters[railIndex]);
		}

		this.proton.addRender(new Proton.SpriteRender(scene));
		this.particlesReady = true;
	};

	customRender = (renderer, scene, camera) => {
		if (!this.particlesReady) { // scene.children.find(t => t.type === 'Points')) {
			console.log('initParticles');
			this.initParticles(scene);
			console.log(this.emitter);
		}

		// move all the emitters along with the music
		for (let railIndex = 0; railIndex < numRails; railIndex++) {
			this.successEmitters[railIndex].p.y = this.state.time * yStretch;
			this.failEmitters[railIndex].p.y = this.state.time * yStretch;
			this.sparkEmitters[railIndex].p.y = this.state.time * yStretch;
		}

		this.proton.update();
		renderer.render(scene, camera);

		Proton.Debug.renderInfo(this.proton, 3);
	};

	render() {
		const {
			width, height, analysis
		} = this.props;

		const yTrackPosition = this.state.time * yStretch;

		const cameraProps = {
			fov: 85, aspect: width / height,
			near: 1, far: 5000,
			position: new THREE.Vector3(50, yTrackPosition, 100),
			lookat: new THREE.Vector3(50, yTrackPosition + 55, 0)
		};

		// const segmentsToRender = analysis.segments.filter(s => s.confidence > 0.3);
		const segmentsToRender = sortBy(takeRight(sortBy(analysis.segments, 'confidence'), 400), 'start');
		const segmentMeshes = [];
		const railSegmentEnds = [];

		segmentsToRender.forEach((segment, segmentIndex) => {
			const mostConfidentPitches = take([...segment.pitches].sort(), 3);

			mostConfidentPitches.forEach((pitchConfidence, pitchLoopIndex) => {
				const pitchIndex = segment.pitches.indexOf(pitchConfidence);
				if (pitchLoopIndex > 0 && pitchConfidence < 0.55) {
					return;
				}

				//	const timbreForPitch = segment.timbre[pitchIndex];
				const yScale = segment.duration * yStretch / 10;
				const segmentWidth = 0.01 + (0.016 * (40 + segment.loudness_max));
				const railForThisSegment = Math.abs((pitchIndex)) % numRails;
				const xPos = (railForThisSegment) * (120 / numRails);
				const yPos = segment.start * yStretch + (yScale * 5);

				if (railSegmentEnds[railForThisSegment] > yPos) {
					// skip this one because there's a segment in the way on this rail
					return;
				}

				// store the end point of this segment on this rail, plus the minimum gap we want
				// between notes on a single rail
				railSegmentEnds[railForThisSegment] = yPos + yScale * 10 + minGap;

				segmentMeshes.push(
					<Mesh key={segmentIndex + '-' + pitchLoopIndex}
						  geometry={boxGeometry}
						  material={(yPos + (yScale * 5)) > yTrackPosition
							  ? this.getMaterial(railForThisSegment) : finishedSegmentMaterials[railForThisSegment]}
						  scale={new THREE.Vector3(
							  Math.min(segmentWidth, 1) * ((120 / numRails) / 10),
							  Math.max(0.5, yScale),
							  0.1
						  )}
						  position={new THREE.Vector3(xPos, yPos, 0)}
					/>
				);
			});
		});

		return (
			<div>
				<Renderer width={width} height={height}
						  enableRapidRender={true}
						  transparent={true}
						  customRender={this.customRender}>
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

