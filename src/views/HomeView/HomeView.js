/* @flow */
import React, {Component} from 'react';
import io from 'socket.io-client';
import SpotifyPlayerStatus from 'components/player/SpotifyPlayerStatus';

import classes from './homeView.css';

class HomeView extends Component {

	clickConnectToWebsocket = () => {
		const socket = io.connect('http://localhost:1337');
		socket.on('hello', (msg) => {
			console.log(`client received hello ${msg}`);
		});
		console.log('about to emit on socket');
		socket.emit('login', 'details');
	};

	render() {
		return (
			<div className={classes.container}>
				<SpotifyPlayerStatus />
				<button onClick={this.clickConnectToWebsocket}>connect to websocket</button>
				<br/>
			</div>
		);
	}
}

export default HomeView;
