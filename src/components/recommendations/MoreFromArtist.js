/**
 * Created by paulbarrass on 09/11/2017.
 */
/* @flow */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import theme from './moreFromArtist.css';
import {spotifyFullAlbumRequest, spotifySearchRequest} from '../../redux/modules/spotify';
import {sortBy} from 'lodash';
import {uiUpdate} from '../../redux/modules/ui';
import {Link} from 'react-router';

class MoreFromArtist extends Component {
	static propTypes = {
		roomId: PropTypes.string,
		artistId: PropTypes.string,
		artistName: PropTypes.string,
		fetchAlbums: PropTypes.func,
		onClickVote: PropTypes.func,
		albums: PropTypes.array,
		excludeAlbumIds: PropTypes.array
	};

	static defaultProps = {
		excludeAlbumIds: []
	};

	fetch = () => {
		const {fetchAlbums} = this.props;
		fetchAlbums();
	};

	componentDidMount() {
		this.fetch();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.artistId !== this.props.artistId) {
			// artist changed, get new data
			this.fetch();
		}

		if (prevProps.albums.length < this.props.albums.length) {

		}
	}

	render() {
		const {albums, artistName, roomId} = this.props;
		// if we have no detailed album information show nothing at all
		if (!albums.find(a => a.release_date)) {
			return null;
		}
		return (
			<div className={theme.container}>
				<div className={theme.title}>
					More from {artistName}
				</div>
				{albums.map(album => {
					const art = album.images.length === 0
						? null : album.images[Math.min(album.images.length - 1, 1)].url;
					return (
						<Link to={`/room/${roomId}/browse/album/${album.id}`}
							  key={album.id}>
							<div className={theme.album}
								 style={{
									 backgroundImage: `url(${art})`
								 }}>
								<div className={theme.albumName}>
									{album.name}
								</div>
								<div className={theme.year}>
									{album.release_date && album.release_date.substr(0, 4)}
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	const albums = [];
	for (let [, album] of Object.entries(state.spotify.fullAlbums)) {
		if (album.artists &&
			album.artists.find(a => a.id === ownProps.artistId &&
			ownProps.excludeAlbumIds.indexOf(album.id) === -1)) {
			albums.push(album);
		}
	}
	return {
		albums: sortBy(albums, 'release_date').reverse()
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	fetchAlbums: () => {
		dispatch(spotifyFullAlbumRequest({artistId: ownProps.artistId}));
	},
	performSearch: (query) => {
		dispatch(uiUpdate({key: 'inRoomSearch', newState: query}));
		dispatch(spotifySearchRequest(query));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(MoreFromArtist);
