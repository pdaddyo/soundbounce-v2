import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class Artists extends Component {
	static propTypes = {
		trackId: PropTypes.string.isRequired,
		artists: PropTypes.array // from redux connect
	};

	render() {
		const {artists} = this.props;
		return (
			<div>{artists.map(a => a.name).join(', ')}</div>
		);
	}
}

// get the artists from the
const mapStateToProps = (state, ownProps) => ({
	artists: state.spotify.tracks[ownProps.trackId]
		? state.spotify.tracks[ownProps.trackId].artists.map(a => ({
			name: a.name,
			id: a.id
		})) : ['?????????']
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Artists);

