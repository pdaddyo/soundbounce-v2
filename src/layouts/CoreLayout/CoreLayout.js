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
				{children}
			</div>
		);
	}
}

export default CoreLayout;
