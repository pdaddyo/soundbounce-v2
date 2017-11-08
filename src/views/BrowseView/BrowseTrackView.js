import React, {Component, PropTypes} from 'react';
import classes from './browseTrackView.css';
import Recommendations from '../../components/recommendations/Recommendations';

export default class BrowseTrackView extends Component {
	static propTypes = {
		params: PropTypes.object
	};

	render() {
		return (
			<div className={classes.container}>
				<h1>Track details & browser go here</h1>
				<Recommendations onClickVote={null}
								 title='Find similar tracks'
								 seedTrackIds={[this.props.params.trackId]}/>
			</div>
		);
	}
}
