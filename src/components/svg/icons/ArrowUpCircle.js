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
				svg={`M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,
				1 22,12A10,10 0 0,1 12,22M12,7L7,12H10V16H14V12H17L12,7Z`}
				{...this.props}
			/>
		);
	}
}
