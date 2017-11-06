/* @flow */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import MultiSlider from 'multi-slider';
import {debounce, take} from 'lodash';
import theme from './discover.css';
import {spotifyRecommendationsRequest} from '../../../redux/modules/spotify';
import Track from '../../track/Track';
import {uiUpdate} from '../../../redux/modules/ui';

const tuneableAttributeList = [
	{name: 'acousticness', min: 0, max: 100, from: 0, to: 100, divisor: 100},
	{name: 'danceability', min: 0, max: 100, from: 0, to: 100, divisor: 100},
	{name: 'energy', min: 0, max: 100, from: 0, to: 100, divisor: 100},
	{name: 'instrumentalness', min: 0, max: 100, from: 0, to: 100, divisor: 100},
	{name: 'liveness', min: 0, max: 100, from: 0, to: 100, divisor: 100},
	{name: 'speechiness', min: 0, max: 100, from: 0, to: 100, divisor: 100},
	{name: 'valence', min: 0, max: 100, from: 0, to: 100, divisor: 100},
	{name: 'popularity', min: 0, max: 100, from: 0, to: 100, divisor: 1},
	{name: 'bpm', min: 50, max: 195, from: 50, to: 180, divisor: 1}
];

class Discover extends Component {
	static propTypes = {
		tracks: PropTypes.array,
		playlist: PropTypes.array,
		tuneableAttributes: PropTypes.array,
		fetchRecommendations: PropTypes.func,
		onClickVote: PropTypes.func,
		setTuneableAttributes: PropTypes.func,
		currentUserId: PropTypes.string,
		spotify: PropTypes.object
	};

	componentDidMount() {
		const {playlist, fetchRecommendations, tuneableAttributes, setTuneableAttributes} = this.props;
		fetchRecommendations({
			trackIds: take(playlist, 5).map(p => p.id),
			tuneableAttributes: tuneableAttributes || tuneableAttributeList
		});

		if (!tuneableAttributes) {
			setTuneableAttributes(tuneableAttributeList);
		}
	}

	sliderChange = (name, values) => {
		const {tuneableAttributes, setTuneableAttributes} = this.props;
		const newAttributes = [];
		for (let attr of tuneableAttributes) {
			if (attr.name === name) {
				const newAttr = {...attr, from: values[0], to: values[0] + values[1]};
				newAttributes.push(newAttr);
			} else {
				newAttributes.push(attr);
			}
		}
		setTuneableAttributes(newAttributes);
		this.debounceFetch();
	};

	debounceFetch = debounce(() => {
		const {playlist, fetchRecommendations, tuneableAttributes} = this.props;
		fetchRecommendations({
			trackIds: take(playlist, 5).map(p => p.id),
			tuneableAttributes
		});
	}, 400);

	render() {
		const {spotify, tuneableAttributes, playlist, currentUserId, onClickVote} = this.props;
		return (
			<div>
				<div className={theme.title}>
					Recommendations
				</div>
				<div className={theme.slidersContainer}>
					{tuneableAttributes && tuneableAttributes.map(ta => (
						<div className={theme.tuneableAttribute} key={ta.name}>
							<div className={theme.attributeName}>
								{ta.name} <span>{ta.from}-{ta.to}</span>
							</div>
							<div className={theme.slider}>
								<MultiSlider
									values={[ta.from, ta.to - ta.from, ta.max - ta.to]}
									handleInnerDotSize={5}
									onChange={this.sliderChange.bind(this, ta.name)}
									bg={'rgba(255,255,255,0.7)'}
									colors={['#333344', '#FA0B84', '#333344']}/>
							</div>
						</div>
					))}
				</div>
				<div className={theme.clear}/>
				{
					spotify.recommendations.map((track, index) => {
						const playlistEntry = playlist.find(i => i.id === track.id);

						const canVote = !playlistEntry ||
							(playlistEntry && !playlistEntry.votes
								.find(v => v.userId === currentUserId));

						return (
							<div className={theme.trackContainer}
								 key={track.id}>
								<Track
									track={{...track, canVote, votes: []}}
									onClickVote={onClickVote}
									size='small'/>
							</div>
						);
					})
				}
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		spotify: state.spotify,
		playlist: state.room.playlist,
		tuneableAttributes: state.ui['tuneableAttributes'],
		currentUserId: state.users.currentUserId
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	fetchRecommendations: ({trackIds, tuneableAttributes}) => {
		dispatch(spotifyRecommendationsRequest({trackIds, tuneableAttributes}));
	},
	setTuneableAttributes: (attributes) => {
		dispatch(uiUpdate({key: 'tuneableAttributes', newState: attributes}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(Discover);
