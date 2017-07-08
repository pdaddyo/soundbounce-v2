/**
 * Created by paulbarrass on 03/05/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Avatar from '../user/avatar/Avatar';

import theme from './track.css';
import DotsVertical from '../svg/icons/DotsVertical';
import ArrowUpThick from '../svg/icons/ArrowUpThick';
import {spotifyPreviewTrack} from '../../redux/modules/spotify';
import {connect} from 'react-redux';
import {syncStart} from '../../redux/modules/sync';

class Track extends Component {
	static propTypes = {
		track: PropTypes.object,
		size: PropTypes.oneOf(['normal', 'hero']),
		percentComplete: PropTypes.number,
		onClickVote: PropTypes.func,
		visible: PropTypes.bool,
		previewStart: PropTypes.func,
		previewStop: PropTypes.func
	};

	static defaultProps = {
		size: 'normal',
		percentComplete: -1,
		visible: true
	};

	artworkMouseDown = evt => {
		this.props.previewStart(this.props.track.id);
		document.addEventListener('mouseup', this.artworkMouseUp);
	};

	artworkMouseUp = evt => {
		document.removeEventListener('mouseup', this.artworkMouseUp);
		this.props.previewStop();
	};

	render() {
		const {track, size, onClickVote, percentComplete, visible} = this.props;
		// helper to append 'Hero' to big size track
		const sizeTheme = (className) =>
			theme[size === 'normal' ? className : className + 'Hero'];

		const votes = (
			<div className={sizeTheme('votes')}>
				<div className={theme.voteUpButton} onClick={() => {
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

		const progress = percentComplete > -1 ? (
			<div className={theme.progressBg}>
				<div className={theme.progress} style={{width: `${percentComplete}%`}}>
				</div>
			</div>
		) : null;
		return (
			<div className={sizeTheme('track')}
				 style={{visibility: visible ? 'visible' : 'hidden'}}>
				<div className={sizeTheme('artwork')}
					 style={{backgroundImage: `url(${track.albumArt})`}}
					 onMouseDown={this.artworkMouseDown}
				>
					{progress}
				</div>
				<div className={sizeTheme('artistsAndTrackName')}>
					<div className={sizeTheme('name')}>
						{track.name}
					</div>
					<div className={sizeTheme('artists')}>
						{track.artists && track.artists.map(artist => artist.name).join(', ')}
					</div>
					{size === 'hero' && votes}
				</div>
				{size === 'normal' && votes}
				<div className={sizeTheme('buttons')}>
					<span className={theme.button}>
						<DotsVertical color={'rgba(255,255,255, 0.8'}/>
					</span>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({
	previewStart: (trackId) => {
		dispatch(spotifyPreviewTrack(trackId));
	},
	previewStop: () => {
		dispatch(syncStart());
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(Track);

