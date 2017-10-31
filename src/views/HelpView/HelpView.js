import React, {Component} from 'react';
import classes from './helpView.css';

export default class HelpView extends Component {
	render() {
		return (
			<div className={classes.container}>
				<h1>HELLLLLP!</h1>
				<a href="https://github.com/pdaddyo/soundbounce-v2/issues/56"
				   target='_blank'>https://github.com/pdaddyo/soundbounce-v2/issues/56</a>
			</div>
		);
	}
}
