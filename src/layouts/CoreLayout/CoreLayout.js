import React, {PropTypes, Component} from 'react';

import classes from './layout.css';

class CoreLayout extends Component {
	static propTypes = {
		children: PropTypes.any
	};

	render() {
		const {children} = this.props;
		return (
			<div className={classes.app}>
				Soundbounce v2
				{children}
			</div>
		);
	}
}

export default CoreLayout;
