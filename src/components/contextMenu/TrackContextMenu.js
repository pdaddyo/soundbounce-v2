/**
 * Created by paulbarrass on 19/10/2017.
 */
import React, {Component, PropTypes} from 'react';
import {connectMenu, ContextMenu, MenuItem, SubMenu} from 'react-contextmenu';
import {spotifyAddTrackToPlaylist} from '../../redux/modules/spotify';
import {connect} from 'react-redux';
import take from 'lodash/take';
import ellipsize from 'ellipsize';
import copy from 'clipboard-copy';
import Popup from 'react-popup';

import '!!style!css!./contextMenu.css';

class TrackContextMenu extends Component {
	static propTypes = {
		myPlaylists: PropTypes.array,
		handleClickSaveToPlaylist: PropTypes.func,
		trigger: PropTypes.object,
		id: PropTypes.any
	};

	static contextTypes = {
		notify: PropTypes.object
	};

	render() {
		const {myPlaylists, handleClickSaveToPlaylist, id, trigger} = this.props;
		const {notify} = this.context;

		if (!trigger) {
			return (
				<ContextMenu id={id}>
					<MenuItem disabled={true}/>
				</ContextMenu>
			);
		}

		const {track} = trigger;
		let album = track.album;
		if (!album && track.json) {
			album = track.json.album;
		}
		const title = `${track.name} by ${track.artists && track.artists.map(artist => artist.name).join(', ')}`;

		let albumMenu = null;

		const songUri = `spotify:track:${track.id}`;
		const songLink = `https://open.spotify.com/track/${track.id}`;

		const copyAndNotify = url => {
			copy(url);
			notify.show('Link copied to clipboard', {type: 'success'});
		};

		if (album) {
			const albumUri = `spotify:album:${album.id}`;
			const albumLink = `https://open.spotify.com/album/${album.id}`;

			albumMenu = (
				<SubMenu title='Album'>
					<MenuItem disabled={true}>
						{trigger && ellipsize(`${album.name}`, 40)}
					</MenuItem>
					<MenuItem divider/>
					<MenuItem data={{album}}
							  onClick={() => {
								  console.log(track);
								  notify.show('Sorry, feature not ready yet');
							  }}>
						Browse in Soundbounce
					</MenuItem>

					<MenuItem data={{album}}
							  onClick={() => {
								  document.location = albumUri;
							  }}>
						View in Spotify
					</MenuItem>
					<MenuItem divider/>
					<MenuItem data={{album}}
							  onClick={() => copyAndNotify(albumLink)}>
						Copy Album Link
					</MenuItem>
					<MenuItem data={{album}}
							  onClick={() => copyAndNotify(albumUri)}>
						Copy Spotify URI
					</MenuItem>
				</SubMenu>
			);
		}
		return (
			<ContextMenu id={id}>
				<MenuItem disabled={true}>
					<span title={title}>{trigger && ellipsize(title, 40)}</span>
				</MenuItem>
				<MenuItem divider/>
				{albumMenu}
				<MenuItem divider/>
				<MenuItem onClick={() => {
					notify.show('Sorry, feature not yet implemented!');
				}}>
					Vote to skip
				</MenuItem>

				{myPlaylists && (
					<SubMenu title='Add to playlist'>
						{
							take(myPlaylists, 50).map(playlist => (
								<MenuItem data={{trigger, playlist}}
										  key={playlist.id}
										  onClick={handleClickSaveToPlaylist}>
									{ellipsize(playlist.name, 50)}
								</MenuItem>
							))
						}
					</SubMenu>
				)}

				<MenuItem onClick={() => {
					Popup.plugins().analysis({
						track
					});
				}}>
					Audio Analysis
				</MenuItem>

				<MenuItem data={{track}}
						  onClick={() => {
							  document.location = `spotify:track:${track.id}`;
						  }}>
					View in Spotify
				</MenuItem>
				<MenuItem divider/>
				<MenuItem data={{album}}
						  onClick={() => copyAndNotify(songLink)}>
					Copy Song Link
				</MenuItem>
				<MenuItem data={{album}}
						  onClick={() => copyAndNotify(songUri)}>
					Copy Spotify URI
				</MenuItem>
			</ContextMenu>
		);
	}
}

const mapStateToProps = state => ({
	myPlaylists: state.spotify.myPlaylists
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	handleClickSaveToPlaylist: (e, {playlist, trigger}) => {
		dispatch(spotifyAddTrackToPlaylist({
			playlistId: playlist.id,
			trackId: trigger.trackId
		}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(connectMenu('track')(TrackContextMenu));

