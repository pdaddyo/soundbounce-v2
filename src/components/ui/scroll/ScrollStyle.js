/**
 * Created by paulbarrass on 30/04/2017.
 */
import React, {Component, PropTypes} from 'react';

export default class ScrollStyle extends Component {
	static propTypes = {
		color: PropTypes.string,
		size: PropTypes.number
	};

	static defaultProps = {
		color: 'rgba(255, 255, 255, 0.6)',
		size: 0.4
	};

	render() {
		const {size, color} = this.props;
		return (
			<style type="text/css">{`
			::-webkit-scrollbar {
				width: ${size}rem;
				height: ${size}rem;
			}
			::-webkit-scrollbar-button {
				width: 0px;
				height: 0px;
			}
			::-webkit-scrollbar-thumb {
				background: ${color};
				opacity: 0.8;
				border: none;
				border-radius: 0;
			}
			::-webkit-scrollbar-thumb:hover {
				background: ${color};
			}
				::-webkit-scrollbar-thumb:active {
				background: ${color};
			}
				::-webkit-scrollbar-track {
				background: transparent;
				border: none;
				border-radius: 0;
			}
				::-webkit-scrollbar-track:hover {
				background: transparent;
			}
				::-webkit-scrollbar-track:active {
				background: transparent;
			}
			::-webkit-scrollbar-corner {
				background: transparent;
			}
			`}</style>
		);
	}
}
