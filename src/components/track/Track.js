/**
 * Created by paulbarrass on 03/05/2017.
 */
import React, {Component, PropTypes} from 'react';
import Avatar from '../user/avatar/Avatar';

import theme from './track.css';
import DotsVertical from '../svg/icons/DotsVertical';
import ArrowUpThick from '../svg/icons/ArrowUpThick';

export default class Track extends Component {
	static propTypes = {
		track: PropTypes.object,
		size: PropTypes.oneOf(['normal', 'hero']),
		percentComplete: PropTypes.number,
		onClickVote: PropTypes.func
	};

	static defaultProps = {
		size: 'normal',
		percentComplete: 0
	};

	render() {
		const {track, size, onClickVote, percentComplete} = this.props;
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

		return (
			<div className={sizeTheme('track')}>
				<div className={sizeTheme('artwork')}
					 style={{backgroundImage: `url(${track.albumArt})`}}>
					<div className={theme.progress} style={{width: `${percentComplete}%`}}>
					</div>
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
