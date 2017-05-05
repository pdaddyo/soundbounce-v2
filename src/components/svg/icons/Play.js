/**
 * Created by paulbarrass on 27/04/2017.
 */
import React, {Component} from 'react';

import Icon from './Icon';

export default class Play extends Component {
	render() {
		return (
			<Icon
				color={'white'}
				size={8}
				svg={'M8,5.14V19.14L19,12.14L8,5.14Z'}
				{...this.props}
			/>
		);
	}
}
