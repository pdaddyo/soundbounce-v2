/**
 * Created by paulbarrass on 03/05/2017.
 */

import React, {Component, PropTypes} from 'react';

export default class Gradient extends Component {
	static contextTypes = {
		colors: PropTypes.object.isRequired
	};

	render() {
		const {colors} = this.context;
		const {rgba, primary} = colors;

		return (
			<div style={{
				background: `linear-gradient(to bottom, ${rgba(primary, 0.25)}, ${rgba(primary, 0)})`,
				position: 'absolute',
				left: '-6rem',
				right: 0,
				top: 0,
				bottom: '20%'
			}}/>
		);
	}
}
