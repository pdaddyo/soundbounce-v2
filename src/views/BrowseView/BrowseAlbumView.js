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
import Waveform from '../../components/track/waveform/Waveform';
import {ContextMenuTrigger} from 'react-contextmenu';

const padDigits = (number, digits) => {
	return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
};

const waveWidth = 200;

const musicKeys = [
	'C',
	'C♯',
	'D',
	'E♭',
	'E',
	'F',
	'F♯',
	'G',
	'A♭',
	'A',
	'B♭',
	'B'
];

class BrowseAlbumView extends Component {
	static propTypes = {
		params: PropTypes.object,
		albumId: PropTypes.string,
		trackId: PropTypes.string,
		roomId: PropTypes.string,
		currentUserId: PropTypes.string,
		currentUserCountry: PropTypes.string,
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
		const {fetchAnalysis, analysis, albumId, track} = this.props;
		if (prevProps.albumId !== albumId) {
			// scroll to top
			this.refs.container && this.refs.container.scrollTo(0, 0);
			this.fetch();
			return;
		}

		if (!prevProps.track && track || prevProps.track.id !== track.id) {
			console.log('track changed');
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

	startPreview = (trackId, offset, evt) => {
		const {roomId, albumId} = this.props;
		this.props.previewStart(trackId, offset);
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
		const {
			album, track, onClickVote, roomId, playlist,
			currentUserId, analysis, features
		} = this.props;
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
								Released {album.release_date} on {album.label}
							</div>
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

									const selected = albumTrack.id === track.id;
									const numTheme = `number${
										this.state.previewingTrackId === albumTrack.id
											? 'Previewing' : ''
										}`;
									return (
										<div
											key={albumTrack.id}
											className={
												theme[`track${selected ? 'Selected' : ''}`]
											}>
											<ContextMenuTrigger id='track'
																ref={ctx => this.contextTrigger = ctx}
																track={track}
																onClickVoteSkip={null}
																attributes={{style: {display: 'block'}}}
																trackId={track.id}
																collect={c => c}
																holdToDisplay={-1}>
												<div className={theme.trackFlex}>
													<div
														className={theme[numTheme]}
														onMouseDown={
															this.startPreview.bind(this, albumTrack.id, null)
														}>
														{albumTrack.track_number}
													</div>
													<div className={theme.trackName}
														 onMouseDown={
															 () => {
																 this.context.router
																	 .push(`/room/${roomId}/browse/album/${album.id}/${albumTrack.id}`);
															 }}>
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

												{selected && (
													<div className={theme.selectedTrackDetails}>
														<div className={theme.wave}
															 ref='wave'
															 onMouseDown={evt => {
																 /* play from offset user clicked */
																 const rect = evt.target.getBoundingClientRect();
																 const x = evt.pageX - rect.left;
																 const percent = x / waveWidth;
																 this.startPreview(
																	 albumTrack.id,
																	 Math.floor(albumTrack.duration_ms * percent)
																 );
															 }}>
															<Waveform analysis={analysis}
																	  progressPercent={-1}
																	  fill='rgba(0,0,0,0.4)'
																	  stroke='rgba(255,255,255,0.7)'
																	  width={waveWidth}
																	  height={20}/>
														</div>
														{features && (
															<div className={theme.bpm}>

															<span className={theme.key}>
																<span>{musicKeys[features.key]}</span>&nbsp;{
																features.mode === 1 ? '' : 'm'
															}
															</span><br/>
																{Math.floor(features.tempo)}bpm
															</div>
														)}
													</div>
												)}
											</ContextMenuTrigger>
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
		trackId,
		albumId,
		album,
		currentUserId: state.users.currentUserId,
		currentUserCountry: state.users.users[state.users.currentUserId].profile.country,
		playlist: state.room.playlist,
		analysis: state.spotify.audioAnalysis[trackId],
		features: state.spotify.audioFeatures[trackId]
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	previewStart: (trackId, offset) => {
		dispatch(spotifyPreviewTrack(trackId, offset));
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
