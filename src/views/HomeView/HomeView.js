/* @flow */
import React, {Component} from 'react';
import {connect} from 'react-redux';

import classes from './homeView.css';

class HomeView extends Component {
	render() {
		return (
			<div className={classes.container}>
				Home
			</div>
		);
	}
}

const mapStateToProps = state => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
