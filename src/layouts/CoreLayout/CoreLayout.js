import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {selectCurrentUser} from 'redux/modules/users';
import MainNavigation from 'components/navigation/MainNavigation';
import BlurredNowPlaying from 'components/player/BlurredNowPlaying';


import theme from './layout.css';
import Dots from 'components/room/backgrounds/Dots';
import TrackContextMenu from 'components/contextMenu/TrackContextMenu';

class CoreLayout extends Component {
	static propTypes = {
		children: PropTypes.any,
		currentUser: PropTypes.object
	};

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
				<TrackContextMenu/>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	currentUser: selectCurrentUser(state)
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CoreLayout);
