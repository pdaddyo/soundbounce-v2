/**
 * Created by paulbarrass on 04/05/2017.
 */

import React, {Component, PropTypes} from 'react';

const rgba = (hex, alpha) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
		: null;
};

export default class SoundbounceLogo extends Component {
	static propTypes = {
		leftColor: PropTypes.string,
		rightColor: PropTypes.string,
		size: PropTypes.number,
		isSynced: PropTypes.bool
	};

	static defaultProps = {
		leftColor: '#00BFFF',
		rightColor: '#FA0B84',
		size: 6
	};

	render() {
		const {size, leftColor, rightColor, isSynced} = this.props;
		return (

			<svg style={{
				width: `${size}rem`,
				height: `${size}rem`
			}} version='1.2' baseProfile='tiny' id='Layer_1' xmlns='http://www.w3.org/2000/svg'
				 x='0px' y='0px' viewBox='0 0 100 100' xmlSpace='preserve'>
				<path fill='none' stroke={rgba(leftColor, 0.75)} strokeWidth='4.3255'
					  strokeMiterlimit='10'
					  d='M29.8,26c14.1,14.1,14.1,36.9,0,51'/>
				<path fill='none' stroke={rgba(leftColor, 0.50)} strokeWidth='5.7674'
					  strokeMiterlimit='10'
					  d='M19.6,36.2c8.4,8.4,8.4,22.1,0,30.6'/>
				<path fill='none' stroke={rgba(leftColor, 0.25)} strokeWidth='5.7674'
					  strokeMiterlimit='10'
					  d='M9.4,46.4c2.8,2.8,2.8,7.4,0,10.2'/>
				{isSynced && (
					<g>
						<linearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='54.8631'
										y1='75.8768' x2='49.0056' y2='61.9089'>
							<stop offset='0' style={{stopColor: rightColor}}/>
							<stop offset='0.5' style={{stopColor: rgba(rightColor, 0.2)}}/>
							<stop offset='1' style={{stopColor: rightColor}}/>
						</linearGradient>
						<path fill='url(#SVGID_1_)'
							  d='M60.55,88.0c-9.8-9.8-15.2-22.8-15.2-36.7h2.9c0,13.1,5.1,25.4,14.4,34.7L60.6,88.2z'/>

					</g>)}
				<path fill='none' stroke={rgba(rightColor, 0.75)} strokeWidth='4.3255'
					  strokeMiterlimit='10'
					  d='M71.8,77c-14.1-14.1-14.1-36.9,0-51'/>
				<path fill='none' stroke={rgba(rightColor, 0.50)} strokeWidth='5.7674'
					  strokeMiterlimit='10'
					  d='M82,66.8c-8.4-8.4-8.4-22.1,0-30.6'/>
				<path fill='none' stroke={rgba(rightColor, 0.25)} strokeWidth='5.7674'
					  strokeMiterlimit='10'
					  d='M92.2,56.6c-2.8-2.8-2.8-7.4,0-10.2'/>
				{isSynced && (<g>
					<path fill='none' stroke={leftColor} strokeWidth='2.8837' strokeMiterlimit='10'
						  d='M54.8,51.5c0,12.9-4.9,25.8-14.8,35.7'/>
					<linearGradient id='SVGID_2_' gradientUnits='userSpaceOnUse' x1='47.5962'
									y1='51.49'
									x2='47.5962' y2='14.787'>
						<stop offset='0' style={{stopColor: leftColor}}/>
						<stop offset='0.5' style={{stopColor: rgba(leftColor, 0.2)}}/>
						<stop offset='1' style={{stopColor: leftColor}}/>
					</linearGradient>
					<path fill='none' stroke='url(#SVGID_2_)' strokeWidth='2.8837'
						  strokeMiterlimit='10'
						  d='M40,16.1c9.9,9.9,14.8,22.8,14.8,35.7'
					/>
				</g>)}

				{isSynced && (
					<path fill='none' stroke={rightColor} strokeWidth='2.8837'
						  strokeMiterlimit='10'
						  d='M46.8,51.5c0-12.9,4.9-25.8,14.8-35.7'/>
				)}

			</svg>


		);
	}
}
