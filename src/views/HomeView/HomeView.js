/* @flow */
import React, {Component} from 'react';
import io from 'socket.io-client';

import classes from './homeView.css';

class HomeView extends Component {
	static propTypes = {};

	clickConnectToWebsocket = () => {
		const socket = io.connect('http://localhost:1337');
		socket.on('hello', (msg) => {
			console.log(`client received hello ${msg}`);
		});
	};

	render() {
		return (
			<div className={classes.container}>
				<a href='/login'>Login to Spotify...</a><br/>
				<button onClick={this.clickConnectToWebsocket}>connect to websocket</button><br/>

			</div>
		);
	}
}

export default HomeView;
