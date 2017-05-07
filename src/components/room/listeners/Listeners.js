import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {selectUsers} from 'redux/modules/users';

import Avatar from 'components/user/avatar/Avatar';

import theme from './listeners.css';

class Listeners extends Component {
	static propTypes = {
		userIds: PropTypes.array.isRequired,
		listeners: PropTypes.array // from redux connect
	};

	render() {
		const {listeners} = this.props;
		return (
			<div className={theme.listeners}>
				{listeners.map(listener => (
					<div key={listener.id}
						 className={theme.listener}>

						<Avatar user={listener}/>
						<div className={theme.name}>{listener.nickname}</div>
					</div>
				))}
			</div>
		);
	}
}

// select the users from the redux state
const mapStateToProps = (state, ownProps) => ({
	listeners: selectUsers(state, ownProps.userIds)
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Listeners);

