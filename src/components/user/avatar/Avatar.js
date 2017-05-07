import React, {Component} from 'react';
import PropTypes from 'prop-types';

import theme from './avatar.css';

class Avatar extends Component {
	static propTypes = {
		user: PropTypes.object.isRequired
	};

	render() {
		const {user} = this.props;
		if (user.avatar) {
			return (
				<div className={theme.avatar}
					 style={{backgroundImage: `url(${user.avatar})`}}/>
			);
		}
		return (
			<div className={theme.avatarInitial}>
				<div className={theme.initial}>{user.nickname.toUpperCase()[0]}</div>
			</div>
		);
	}
}

export default Avatar;
