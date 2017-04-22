import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class Title extends Component {
	static propTypes = {
		trackId: PropTypes.string.isRequired,
		name: PropTypes.string // from redux connect
	};

	render() {
		const {name} = this.props;
		return (
			<div>{name}</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	name: state.spotify.tracks[ownProps.trackId]
		? state.spotify.tracks[ownProps.trackId].name : '?????????'
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Title);

