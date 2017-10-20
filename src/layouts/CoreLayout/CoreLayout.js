import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {selectCurrentUser} from 'redux/modules/users';
import NotifyContainer from 'react-alert';
import MainNavigation from 'components/navigation/MainNavigation';
import BlurredNowPlaying from 'components/player/BlurredNowPlaying';
import Dots from 'components/room/backgrounds/Dots';

import theme from './layout.css';

class CoreLayout extends Component {
	static propTypes = {
		children: PropTypes.any,
		currentUser: PropTypes.object
	};

	static childContextTypes = {
		notify: PropTypes.object
	};

	getChildContext() {
		return {notify: this.notifyRef};
	}

	// store ref to the notify container
	notifyRef = null;

	render() {
		const {children, currentUser} = this.props;
		if (!currentUser) {
			return null;
		}
		return (
			<div className={theme.app}>
				<div className={theme.bg}>
					<BlurredNowPlaying/>
					<Dots />
				</div>
				<MainNavigation/>
				<div className={theme.container}>
					{children}
				</div>
				<NotifyContainer ref={a => this.notifyRef = a}
								 offset={20}
								 position='bottom left'
								 theme='dark'
								 time={5000}
								 transition='scale'/>

			</div>
		);
	}
}

const mapStateToProps = state => ({
	currentUser: selectCurrentUser(state)
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CoreLayout);
