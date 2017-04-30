/**
 * Created by paulbarrass on 27/04/2017.
 */
import React, {Component, PropTypes} from 'react';

export default class Icon extends Component {
	static propTypes = {
		color: PropTypes.string,
		size: PropTypes.number,
		svg: PropTypes.string
	};

	static defaultProps = {
		color: 'rgba(255, 255, 255, 0.6)',
		size: 1.5
	};

	render() {
		const {size, color, svg} = this.props;
		return (
			<svg style={{width: `${size}rem`, height: `${size}rem`}} viewBox="0 0 24 24">
				<path fill={color}
					  d={svg}/>
			</svg>
		);
	}
}
