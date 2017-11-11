import React, {Component, PropTypes} from 'react';
import Recommendations from '../../components/recommendations/Recommendations';
import {
	spotifyAudioAnalysisRequest, spotifyFullAlbumRequest
} from '../../redux/modules/spotify';
import {connect} from 'react-redux';
import intersperse from 'shared/intersperse';

import theme from './browseAlbumView.css';
import MoreFromArtist from '../../components/recommendations/MoreFromArtist';
import Loading from '../../components/svg/loading/Loading';
import {Link} from 'react-router';

class BrowseAlbumView extends Component {
	static propTypes = {
		params: PropTypes.object,
		albumId: PropTypes.string,
		roomId: PropTypes.string,
		track: PropTypes.object,
		album: PropTypes.object,
		analysis: PropTypes.object,
		features: PropTypes.object,
		onClickVote: PropTypes.func,
		fetchAnalysis: PropTypes.func,
		fetchFullAlbum: PropTypes.func
	};

	fetch = () => {
		const {fetchAnalysis, fetchFullAlbum, album, analysis, albumId} = this.props;
		if (!album && albumId) {
			fetchFullAlbum(albumId);
		}
		if (!analysis) {
			fetchAnalysis();
		}
	};

	componentDidMount() {
		this.fetch();
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.track || !this.props.track) {
			return;
		}
		if (prevProps.track.id !== this.props.track.id) {
			// track changed, get new data
			this.fetch();
		}
	}

	render() {
		const {album, track, onClickVote, roomId} = this.props;
		if (!album) {
			return (<div className={theme.container}><Loading/></div>);
		}
		const art = album.images[Math.min(album.images.length - 1, 1)].url;

		console.log(album);
		return (
			<div className={theme.container}>
				{track && album && (
					<div className={theme.album}>
						<div className={theme.artworkAndCopyright}>
							<div className={theme.artwork} style={{
								backgroundImage: `url(${art})`
							}}/>
							<div className={theme.date}>
								Released {album.release_date} on {album.label}</div>
							<div>
								{album.copyrights && album.copyrights.map((c, i) => <div
									key={i}
									className={theme.copy}>
									© {c.text.replace('©', '')}</div>)}

							</div>
						</div>
						<div className={theme.trackList}>
							<div className={theme.albumName}>
								{album.name}
							</div>
							<div className={theme.artists}>
								{album.artists && intersperse(album.artists.map(artist => (
									<span className={theme.artist}
										  key={artist.id}>
								{artist.name}
								</span>
								)), ', ')}
							</div>
							<div className={theme.tracks}>
								{album.tracks.items.map(albumTrack => (
									<div className={
										theme[`track${albumTrack.id === track.id ? 'Selected' : ''}`]
									}>
										<div className={theme.number}>
											{albumTrack.track_number}
										</div>
										<div className={theme.trackName}>
											<Link
												to={`/room/${roomId}/browse/album/${album.id}/${albumTrack.id}`}
											>
												{albumTrack.name}
											</Link>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
				{track && track.artists.map(a => (
					<MoreFromArtist artistId={a.id}
									key={a.id}
									excludeAlbumIds={[album.id]}
									roomId={roomId}
									artistName={a.name}/>
				))}
				{track && <Recommendations onClickVote={onClickVote}
										   title='Find similar tracks'
										   seedTrackIds={[this.props.track.id]}/>}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	const trackId = ownProps.params.trackId;
	const albumId = ownProps.params.albumId;
	const album = albumId && state.spotify.fullAlbums[albumId];
	let track = null;
	if (trackId) {
		track = state.spotify.tracks[trackId];
	} else {
		if (album) {
			// select first track on album
			track = album.tracks.items[0];
		}
	}
	return {
		track,
		albumId,
		album,
		analysis: state.spotify.audioAnalysis[trackId],
		features: state.spotify.audioFeatures[trackId]
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	fetchAnalysis: () => {
		const {trackId} = ownProps.params;
		if (trackId) {
			dispatch(spotifyAudioAnalysisRequest(trackId));
		}
	},
	fetchFullAlbum: (albumId) => {
		dispatch(spotifyFullAlbumRequest({albumIds: [albumId]}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(BrowseAlbumView);
