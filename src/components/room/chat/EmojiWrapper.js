import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import theme from './emojiWrapper.css';

class EmojiWrapper extends Component {
	static propTypes = {
		children: PropTypes.any,
		onClickEmojiAnimation: PropTypes.func,
		emojiId: PropTypes.string,
		animation: PropTypes.string,
		canClick: PropTypes.bool
	};

	handleClick = evt => {
		const {onClickEmojiAnimation, emojiId, canClick} = this.props;

		if (canClick) {
			onClickEmojiAnimation({emojiId, animation: 'wobble'});
		}
	};

	render() {
		const {animation = 'none', children} = this.props;
		return (
			<span onClick={this.handleClick}
				  ref='span'
				  className={theme[animation]}>
				{children}
			</span>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	animation: state.ui[`emoji-animation-${ownProps.emojiId}`]
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	linkUnfurlingRequestStart: (url) => {
		dispatch(({url}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(EmojiWrapper);

