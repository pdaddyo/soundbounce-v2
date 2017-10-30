/**
 * Created by paulbarrass on 03/05/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Avatar from '../user/avatar/Avatar';

import theme from './track.css';
import DotsVertical from '../svg/icons/DotsVertical';
import ArrowUpThick from '../svg/icons/ArrowUpThick';
import {spotifyPreviewTrack, spotifySearchRequest} from '../../redux/modules/spotify';
import {connect} from 'react-redux';
import {syncStart} from '../../redux/modules/sync';
import {uiUpdate} from '../../redux/modules/ui';
import intersperse from 'shared/intersperse';
import {ContextMenuTrigger} from 'react-contextmenu';
import {selectCurrentUser} from '../../redux/modules/users';
import trackReactionEmojiList from '../room/chat/trackReactionEmojiList';
import emojifyWithOptions from '../room/chat/emojifyWithOptions';

class Track extends Component {
	static propTypes = {
		track: PropTypes.object,
		size: PropTypes.oneOf(['normal', 'hero', 'small']),
		percentComplete: PropTypes.number,
		onClickVote: PropTypes.func,
		onClickReaction: PropTypes.func,
		visible: PropTypes.bool,
		previewStart: PropTypes.func,
		previewStop: PropTypes.func,
		currentRoomId: PropTypes.string,
		performSearch: PropTypes.func,
		selectedReactionEmoji: PropTypes.string
	};

	static contextTypes = {
		router: PropTypes.object
	};

	static defaultProps = {
		size: 'normal',
		percentComplete: -1,
		visible: true
	};

	// trigger for context menu
	contextTrigger = null;

	artworkMouseDown = evt => {
		this.props.previewStart(this.props.track.id);
		document.addEventListener('mouseup', this.artworkMouseUp);
	};

	artworkMouseUp = evt => {
		document.removeEventListener('mouseup', this.artworkMouseUp);
		this.props.previewStop();
	};

	render() {
		const {
			track, size, onClickVote, onClickReaction, percentComplete,
			visible, currentRoomId, performSearch, selectedReactionEmoji
		} = this.props;
		const {router} = this.context;

		// helper to append 'Hero' or 'Small' to the theme items
		const sizeTheme = (className) => {
			switch (size) {
				case 'normal':
					return theme[className];
				case 'hero':
					return theme[className + 'Hero'];
				case 'small':
					return theme[className + 'Small'];
			}
		};

		if (!track) {
			return null;
		}

		let votes = track.votes && (
				<div className={sizeTheme('votes')}>


					<div className={theme.voteUpButton}
						 onClick={() => {
							 if (track.canVote && onClickVote) {
								 onClickVote(track.id);
							 }
						 }}>
						{track.canVote && (
							<ArrowUpThick/>
						)}
					</div>


					{track.votes.map(vote => (
						<div className={sizeTheme('avatarContainer')} key={vote.user.id}>
							<Avatar user={vote.user}/>
						</div>
					))}

				</div>
			);

		if (size === 'small') {
			votes = null;
			if (track.canVote) {
				votes = (
					<div className={sizeTheme('votes')}>
						<div className={theme.voteUpButton}
							 onClick={() => {
								 if (track.canVote && onClickVote) {
									 onClickVote(track.id);
								 }
							 }}>
							<ArrowUpThick size={1.6}/>
						</div>
					</div>
				);
			}
		}

		const progress = percentComplete > -1 ? (
			<div className={theme.progressBg}>
				<div className={theme.progress} style={{width: `${percentComplete}%`}}>
				</div>
			</div>
		) : null;

		const albumArt = track.albumArt || (track.album &&
			(track.album.images.length > 1
					? track.album.images[1].url : (
						track.album.images.length === 1
							? track.album.images[0].url : null
					)
			));

		return (
			<ContextMenuTrigger id='track'
								ref={ctx => this.contextTrigger = ctx}
								track={track}
								attributes={{style: {display: 'block'}}}
								trackId={track.id}
								collect={c => c}
								holdToDisplay={-1}>
				<div className={sizeTheme('track')}
					 style={{visibility: visible ? 'visible' : 'hidden'}}>
					<div className={sizeTheme('artwork')}
						 style={{backgroundImage: `url(${albumArt})`}}
						 onMouseDown={this.artworkMouseDown}>
						{progress}
					</div>
					<div className={sizeTheme('artistsAndTrackName')}>
						<div className={sizeTheme('name')}>
							{track.name}
						</div>
						<div className={sizeTheme('artists')}>
							{track.artists && intersperse(track.artists.map(artist => (
								<span className={theme.artist}
									  key={artist.id}
									  onClick={() => {
										  router.push(`/room/${currentRoomId}/search`);
										  performSearch(`artist:"${artist.name}"`);
									  }}>
								{artist.name}
								</span>
							)), ', ')}
						</div>

						{size === 'hero' && votes}

					</div>


					{(size === 'normal' || size === 'small') && votes}
					{size !== 'small' && (
						<div className={sizeTheme('buttons')}>
							{/* reaction icon e.g. heart this track */}
							{percentComplete > -1 && (

								<ContextMenuTrigger id='reaction'
													collect={c => c}
													holdToDisplay={400}>
									<div className={theme.reactionButton}
										 onClick={() => {
											 if (onClickReaction) {
												 onClickReaction({
													 trackId: track.id,
													 emoji: selectedReactionEmoji
												 });
											 }
										 }}>

										{emojifyWithOptions(selectedReactionEmoji)}

									</div>
								</ContextMenuTrigger>
							)}
							<span className={theme.dotsButton}
								  onClick={e => {
									  if (this.contextTrigger) {
										  this.contextTrigger.handleContextClick(e);
									  }
								  }}>
								<DotsVertical color={'rgba(255,255,255, 0.8'}/>
							</span>
						</div>
					)}
				</div>
			</ContextMenuTrigger>
		);
	}
}

const mapStateToProps = state => {
	const currentUser = selectCurrentUser(state);
	let emoji = trackReactionEmojiList[0].emoji;
	if (currentUser && currentUser.prefs) {
		emoji = currentUser.prefs['selectedReactionEmoji'];
	}
	return {
		currentRoomId: state.room.id,
		selectedReactionEmoji: emoji
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	previewStart: (trackId) => {
		dispatch(spotifyPreviewTrack(trackId));
	},
	previewStop: () => {
		dispatch(syncStart());
	},
	performSearch: (query) => {
		dispatch(uiUpdate({key: 'inRoomSearch', newState: query}));
		dispatch(spotifySearchRequest(query));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(Track);

