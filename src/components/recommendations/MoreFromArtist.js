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

class MoreFromArtist extends Component {
	static propTypes = {
		artistId: PropTypes.string,
		artistName: PropTypes.string,
		fetchAlbums: PropTypes.func,
		onClickVote: PropTypes.func,
		albums: PropTypes.array
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
	}

	render() {
		const {albums, artistName} = this.props;
		return (
			<div className={theme.container}>
				<div className={theme.title}>
					More from {artistName}
				</div>
				{albums.map(album => (
					<div className={theme.album} key={album.id}
						 style={{
							 backgroundImage: `url(${album
								 .images[Math.min(album.images.length - 1, 1)].url})`
						 }}
						 onClick={() => {
							 router.push(`/room/${currentRoomId}/search`);
							 performSearch(`artist:"${artist.name}"`);
						 }}>
						<div className={theme.albumName}>
							{album.name}
						</div>
						<div className={theme.year}>
							{album.release_date && album.release_date.substr(0, 4)}
						</div>
					</div>
				))}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	const albums = [];
	for (let [, album] of Object.entries(state.spotify.fullAlbums)) {
		if (album.artists && album.artists.find(a => a.id === ownProps.artistId)) {
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
