/**
 * Created by paulbarrass on 21/10/2017.
 */
import React, {Component, PropTypes} from 'react';
import Popup from 'react-popup';
import {spotifyAudioAnalysisRequest} from '../../redux/modules/spotify';
import {connect} from 'react-redux';

class Analysis extends Component {
	static propTypes = {
		track: PropTypes.object,
		analysis: PropTypes.object,
		fetchAnalysis: PropTypes.func
	};

	componentDidMount() {
		this.props.fetchAnalysis();
	}

	render() {
		const {track} = this.props;
		return (
			<div>
				{JSON.stringify(track)}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	currentRoomId: state.room.id
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	fetchAnalysis: () => {
		dispatch(spotifyAudioAnalysisRequest(ownProps.track.id));
	}
});

const ConnectedAnalysis = connect(mapStateToProps, mapDispatchToProps)(Analysis);

Popup.registerPlugin('analysis', function ({
											   track
										   }) {
	this.create({
		title: track.name,
		content: <ConnectedAnalysis track={track}/>,
		buttons: {
			right: ['ok']
		}
	});
});
