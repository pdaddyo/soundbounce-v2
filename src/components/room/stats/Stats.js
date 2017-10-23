import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import theme from './about.css';
import {socketRoomStatsRequest} from '../../../redux/modules/socket';

class Stats extends Component {
	static propTypes = {
		room: PropTypes.object
	};

	componentDidMount() {
		this.props.requestStats();
	}

	render() {
		const {room, currentUser} = this.props;
		const {stats} = room;
		return (
			<div className={theme.about}>
				{stats && JSON.stringify(stats)}
			</div>
		);
	}
}

// select the users from the redux state
const mapStateToProps = (state, ownProps) => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({
	requestStats: () => {
		dispatch(socketRoomStatsRequest(ownProps.room.id));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(Stats);

