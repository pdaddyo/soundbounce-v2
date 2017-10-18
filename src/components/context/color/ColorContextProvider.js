/**
 * Created by paulbarrass on 01/05/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import rgba from 'shared/rgba';

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

		return {colors: {rgba, ...this.props.colors}};
	}

	render() {
		const {children} = this.props;
		return <div>
			{children}
		</div>;
	}
}
