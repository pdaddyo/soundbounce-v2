import React, {Component} from 'react';
import classes from './helpView.css';

export default class HelpView extends Component {
	render() {
		return (
			<div className={classes.container}>
				<h1>Help and Support</h1>
				<p>
					Welcome to Soundbounce, synchronised social listening via Spotify Connect.
				</p>
				<p>
					<a href='https://support.spotify.com/bg/listen_everywhere/supported_connection_types/spotify-connect/'
					   target='_blank'>
						Get help with Spotify Connect
					</a>
				</p>
				<a href="https://github.com/pdaddyo/soundbounce-v2/issues/56"
				   target='_blank'>https://github.com/pdaddyo/soundbounce-v2/issues/56</a>
			</div>
		);
	}
}
