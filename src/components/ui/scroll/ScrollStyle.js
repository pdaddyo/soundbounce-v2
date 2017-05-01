/**
 * Created by paulbarrass on 30/04/2017.
 */
import React, {Component, PropTypes} from 'react';

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
		if (!colors || !colors[colorConfigName]) {
			return null;
		}
		const color = colors.rgba(colors[colorConfigName], alpha);
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
