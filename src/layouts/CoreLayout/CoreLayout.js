import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {selectCurrentUser} from 'redux/modules/users';
import TopBar from 'components/topBar/TopBar';
import classes from './layout.css';

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

			<div className={classes.app}>
				<TopBar/>
				<div className={classes.children}>
					{children}
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	currentUser: selectCurrentUser(state)
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CoreLayout);
