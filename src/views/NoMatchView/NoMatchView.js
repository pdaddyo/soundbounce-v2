/* @flow */
import React, {Component} from 'react';
import classes from './noMatchView.css';

export default class NoMatchView extends Component {
	render() {
		return (
			<div className={classes.container}>
				<h1>Oops something went wrong</h1>
			</div>
		);
	}
}
