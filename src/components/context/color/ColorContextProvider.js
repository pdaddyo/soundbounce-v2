/**
 * Created by paulbarrass on 01/05/2017.
 */
import React, {Component, PropTypes} from 'react';

export default class ColorContextProvider extends Component {

	static propTypes = {
		colors: PropTypes.object,
		children: PropTypes.any
	};

	static childContextTypes = {
		colors: PropTypes.object
	};

	getChildContext() {
		// converts a hex colour to an rgba with alpha
		const rgba = (hex, alpha) => {
			const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result
				? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
				: null;
		};

		return {colors: {rgba, ...this.props.colors}};
	}

	render() {
		const {children} = this.props;
		return <div>
			{children}
		</div>;
	}
}
