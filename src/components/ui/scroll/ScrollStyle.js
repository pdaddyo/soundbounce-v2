/**
 * Created by paulbarrass on 30/04/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import rgba from 'shared/rgba';

export default class ScrollStyle extends Component {
	static propTypes = {
		colorConfigName: PropTypes.string,
		alpha: PropTypes.number,
		size: PropTypes.number
	};

	static contextTypes = {
		colors: PropTypes.object
	};

	static defaultProps = {
		colorConfigName: 'primary',
		alpha: 0.2,
		size: 0.4
	};

	render() {
		const {size, colorConfigName, alpha} = this.props;

		const {colors} = this.context; // gets these from the <ColorContextProvider> up the tree

		let color = '#999999';
		if (colors && colors[colorConfigName]) {
			color = colors[colorConfigName];
		}
		color = rgba(color, alpha);
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
				background: ${rgba(color, 0.4)};
			}
				::-webkit-scrollbar-thumb:active {
				background: ${rgba(color, 0.4)};
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
