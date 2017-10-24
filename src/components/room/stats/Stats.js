import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Track from 'components/track/Track';

import theme from './stats.css';
import {socketRoomStatsRequest} from '../../../redux/modules/socket';

class Stats extends Component {
	static propTypes = {
		room: PropTypes.object,
		requestStats: PropTypes.func,
		topTracks: PropTypes.array
	};

	componentDidMount() {
		this.props.requestStats();
	}

	render() {
		const {topTracks, room} = this.props;
		return (
			<div className={theme.about}>
				{topTracks && (
					<div>
						<div className={theme.title}>
							Top {topTracks.length} tracks in {room.name}
						</div>
						<ol className={theme.list}>
							{topTracks.map(({track, plays}) => (
								<li className={theme.li}>
									<div className={theme.row}><Track
										track={{...track, votes: [], canVote: false}}
										size='normal'/>
									</div>
								</li>

							))}
						</ol>
					</div>
				)}
			</div>
		);
	}
}

// select the users from the redux state
const mapStateToProps = (state, ownProps) => ({
	topTracks: state.room.stats ? state.room.stats.topTracks.map(({id, plays}) => ({
		track: state.spotify.tracks[id],
		plays
	})) : []
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	requestStats: () => {
		dispatch(socketRoomStatsRequest(ownProps.room.id));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(Stats);

