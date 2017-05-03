/**
 * Created by paulbarrass on 27/04/2017.
 */
import React, {Component} from 'react';

import Icon from './Icon';

export default class DotsVertical extends Component {
	render() {
		return (
			<Icon
				color={'white'}
				size={1.75}
				svg={`M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,
				1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,
				1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,
				1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z`}
				{...this.props}
			/>
		);
	}
}
