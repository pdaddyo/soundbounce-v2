import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import theme from './about.css';

class About extends Component {
	static propTypes = {
		room: PropTypes.object,
		currentUser: PropTypes.object
	};

	render() {
		const {room, currentUser} = this.props;
		const isOwner = currentUser.id === room.creatorId;
		return (
			<div className={theme.about}>
				{room.name}

				{isOwner && (
					<div>Room owner settings:</div>
				)}
			</div>
		);
	}
}

// select the users from the redux state
const mapStateToProps = (state, ownProps) => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(About);

