/**
 * Created by paulbarrass on 19/10/2017.
 */
import React, {Component, PropTypes} from 'react';
import {connectMenu, ContextMenu, MenuItem, SubMenu} from 'react-contextmenu';
import {spotifyAddTrackToPlaylist} from '../../redux/modules/spotify';
import {connect} from 'react-redux';
import take from 'lodash/take';
import ellipsize from 'ellipsize';

import '!!style!css!./contextMenu.css';

class TrackContextMenu extends Component {
	static propTypes = {
		myPlaylists: PropTypes.array,
		handleClickSaveToPlaylist: PropTypes.func,
		trigger: PropTypes.object,
		id: PropTypes.any
	};

	handleClick(e, data) {
		console.log(data);
	}

	render() {
		const {myPlaylists, handleClickSaveToPlaylist, id, trigger} = this.props;
		return (
			<ContextMenu id={id}>
				<MenuItem onClick={this.handleClick}>
					Vote to skip
				</MenuItem>

				{myPlaylists && <MenuItem divider/>}
				{myPlaylists && (
					<SubMenu title='Save to playlist'>
						{
							take(myPlaylists, 15).map(playlist => (
								<MenuItem data={{trigger, playlist}}
										  key={playlist.id}
										  onClick={handleClickSaveToPlaylist}>
									{ellipsize(playlist.name, 50)}
								</MenuItem>
							))
						}
					</SubMenu>
				)}
				<MenuItem divider/>
				<MenuItem onClick={this.handleClick}>
					View artist
				</MenuItem>
				<MenuItem onClick={this.handleClick}>
					View album
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

