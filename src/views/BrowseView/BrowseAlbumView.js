import React, {Component, PropTypes} from 'react';
import Recommendations from '../../components/recommendations/Recommendations';
import {
	spotifyAudioAnalysisRequest, spotifyFullAlbumRequest, spotifyPreviewTrack
} from '../../redux/modules/spotify';
import {connect} from 'react-redux';
import intersperse from 'shared/intersperse';

import theme from './browseAlbumView.css';
import MoreFromArtist from '../../components/recommendations/MoreFromArtist';
import Loading from '../../components/svg/loading/Loading';
import {syncStart} from '../../redux/modules/sync';
import ArrowUpThick from '../../components/svg/icons/ArrowUpThick';

const padDigits = (number, digits) => {
	return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
};

class BrowseAlbumView extends Component {
	static propTypes = {
		params: PropTypes.object,
		albumId: PropTypes.string,
		roomId: PropTypes.string,
		currentUserId: PropTypes.string,
		playlist: PropTypes.array,
		track: PropTypes.object,
		album: PropTypes.object,
		analysis: PropTypes.object,
		features: PropTypes.object,
		onClickVote: PropTypes.func,
		previewStart: PropTypes.func,
		previewStop: PropTypes.func,
		fetchAnalysis: PropTypes.func,
		fetchFullAlbum: PropTypes.func
	};

	static contextTypes = {
		router: PropTypes.object
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
		const {fetchAnalysis, analysis} = this.props;

		if (prevProps.albumId !== this.props.albumId) {
			this.refs.container && this.refs.container.scrollTo(0, 0);
			this.fetch();
			return;
		}
		if (!prevProps.track || !this.props.track) {
			return;
		}
		if (prevProps.track.id !== this.props.track.id) {
			// track changed, get new data
			if (!analysis) {
				fetchAnalysis();
			}
		}
	}

	constructor(props) {
		super(props);
		this.state = {previewingTrackId: null};
	}

	startPreview = (trackId, evt) => {
		const {roomId, albumId} = this.props;
		this.props.previewStart(trackId);
		this.setState({previewingTrackId: trackId});
		this.context.router.push(`/room/${roomId}/browse/album/${albumId}/${trackId}`);
		document.addEventListener('mouseup', this.stopPreview);
	};

	stopPreview = evt => {
		document.removeEventListener('mouseup', this.stopPreview);
		this.setState({previewingTrackId: null});
		this.props.previewStop();
	};

	render() {
		const {album, track, onClickVote, roomId, playlist, currentUserId} = this.props;
		if (!album) {
			return (<div className={theme.container}><Loading/></div>);
		}
		const art = album.images[Math.min(album.images.length - 1, 1)].url;
		return (
			<div className={theme.container} ref='container'>
				{track && album && (
					<div className={theme.album}>
						<div className={theme.artworkAndCopyright}>
							<div className={theme.artwork}
								 style={{
									 backgroundImage: `url(${art})`
								 }}
								 onMouseDown={
									 this.startPreview.bind(this, track.id)
								 }/>
							<div className={theme.date}>
								Released {album.release_date} on {album.label}</div>
							<div>
								{album.copyrights && album.copyrights.length > 0 && (
									<div className={theme.copy}>
										© {album.copyrights[0].text.replace('©', '')}
									</div>
								)}
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
								{album.tracks.items.map(albumTrack => {
									const playlistEntry = playlist.find(i => i.id === albumTrack.id);

									const canVote = !playlistEntry ||
										(playlistEntry && !playlistEntry.votes
											.find(v => v.userId === currentUserId));

									return (
										<div
											key={albumTrack.id}
											className={
												theme[`track${albumTrack.id === track.id ? 'Selected' : ''}`]
											}>
											<div
												className={theme[`number${this.state.previewingTrackId === albumTrack.id ? 'Previewing' : ''}`]}
												onMouseDown={
													this.startPreview.bind(this, albumTrack.id)
												}>
												{albumTrack.track_number}
											</div>
											<div className={theme.trackName}
												 onMouseDown={
													 this.startPreview.bind(this, albumTrack.id)
												 }>
												{albumTrack.name}
											</div>
											<div className={theme.duration}>
												{Math.floor(albumTrack.duration_ms / 1000 / 60)}:{
												padDigits(Math.floor(albumTrack.duration_ms / 1000) % 60, 2)
											}
											</div>
											{canVote && (
												<div className={theme.upvote}>
													<div className={theme.upvoteInner}
														 onClick={onClickVote.bind(this, albumTrack.id)}>
														<ArrowUpThick size={1.25}/>
													</div>
												</div>
											)}
										</div>
									);
								})}
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
		currentUserId: state.users.currentUserId,
		playlist: state.room.playlist,
		analysis: state.spotify.audioAnalysis[trackId],
		features: state.spotify.audioFeatures[trackId]
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	previewStart: (trackId) => {
		dispatch(spotifyPreviewTrack(trackId));
	},
	previewStop: () => {
		dispatch(syncStart());
	},
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
