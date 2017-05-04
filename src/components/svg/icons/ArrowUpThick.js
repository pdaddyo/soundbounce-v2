/**
 * Created by paulbarrass on 27/04/2017.
 */
import React, {Component} from 'react';

import Icon from './Icon';

export default class ArrowUpCircle extends Component {
	render() {
		return (
			<Icon
				color={'white'}
				size={1.75}
				svg={`M14,20H10V11L6.5,14.5L4.08,12.08L12,4.16L19.92,
				12.08L17.5,14.5L14,11V20Z`}
				{...this.props}
			/>
		);
	}
}
