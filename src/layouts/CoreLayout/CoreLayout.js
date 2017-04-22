import React, {PropTypes, Component} from 'react';
import TopBar from 'components/topBar/TopBar';
import classes from './layout.css';

class CoreLayout extends Component {
	static propTypes = {
		children: PropTypes.any
	};

	render() {
		const {children} = this.props;
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

export default CoreLayout;
