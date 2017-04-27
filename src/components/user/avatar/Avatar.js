import React, {Component, PropTypes} from 'react';

import theme from './avatar.css';

class Avatar extends Component {
	static propTypes = {
		src: PropTypes.string
	};

	render() {
		const {src} = this.props;
		return (
			<div className={theme.avatar}
				 style={{backgroundImage: `url(${src})`}}/>
		);
	}
}

export default Avatar;

