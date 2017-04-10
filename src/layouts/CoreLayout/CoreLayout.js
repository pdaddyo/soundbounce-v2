import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';

import classes from './layout.css';

class CoreLayout extends Component {
	static propTypes = {
		children: PropTypes.any
	};

	static contextTypes = {
		router: PropTypes.object
	};

	componentDidMount() {
		// if this mounts, the app is starting for the first time
		this.startup();
	}

	startup() {

	}

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

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({});

// export default connect(mapStateToProps, mapDispatchToProps)(CoreLayout);
export default CoreLayout;
