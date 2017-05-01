/**
 * Created by paulbarrass on 27/04/2017.
 */
import React, {Component} from 'react';

import Icon from './Icon';

export default class RoomLeave extends Component {
	render() {
		/*  fullscreen exit:

		 M14,14H19V16H16V19H14V14M5,14H10V19H8V16H5V14M8,
		 5H10V10H5V8H8V5M19,8V10H14V5H16V8H19Z

		 */
		return (
			<Icon
				color={'white'}
				size={1.75}
				svg={`M16,20H20V16H16M16,14H20V10H16M10,8H14V4H10M16,
				8H20V4H16M10,14H14V10H10M4,14H8V10H4M4,20H8V16H4M10,
				20H14V16H10M4,8H8V4H4V8Z`}
				{...this.props}
			/>
		);
	}
}
