/**
 * Created by paulbarrass on 03/05/2017.
 */
import React, {Component, PropTypes} from 'react';
import Avatar from '../user/avatar/Avatar';

import theme from './track.css';

export default class Track extends Component {
	static propTypes = {
		track: PropTypes.object,
		size: PropTypes.oneOf(['normal', 'hero']),
		canVote: PropTypes.bool
	};

	static defaultProps = {
		size: 'normal'
	};

	render() {
		const {track, size} = this.props;
		// helper to append 'Hero' to big size track
		const sizeTheme = (className) =>
			theme[size === 'normal' ? className : className + 'Hero'];

		const votes = (
			<div className={sizeTheme('votes')}>
				{track.votes.map(vote => (
					<div className={sizeTheme('avatarContainer')}>
						<Avatar user={vote.user}/>
					</div>
				))}
			</div>
		);

		return (
			<div className={sizeTheme('track')}>
				<div className={sizeTheme('artwork')}
					 style={{backgroundImage: `url(${track.albumArt})`}}>
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
			</div>
		);
	}
}
