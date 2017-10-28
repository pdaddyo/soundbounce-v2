import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {ContextMenuTrigger} from 'react-contextmenu';
import emojiAnimationList from './emojiAnimationList';

import theme from './emojiWrapper.css';

class EmojiWrapper extends Component {
	static propTypes = {
		children: PropTypes.any,
		onClickEmojiAnimation: PropTypes.func,
		emojiId: PropTypes.string,
		emojiAnimation: PropTypes.string,
		selectedAnimation: PropTypes.string,
		canClick: PropTypes.bool
	};

	handleClick = evt => {
		const {
			onClickEmojiAnimation,
			emojiId,
			selectedAnimation = emojiAnimationList[0].cssClass  // default to the first in list
		} = this.props;

		onClickEmojiAnimation({emojiId, animation: selectedAnimation});
	};

	render() {
		const {emojiAnimation = 'none', children, canClick} = this.props;
		if (!canClick) {
			return <span className={theme[emojiAnimation]}>{children}</span>;
		}

		return (
			<ContextMenuTrigger id='emoji-animation'
								collect={c => c}
								holdToDisplay={-1}>
				<span onClick={this.handleClick}
					  className={theme[emojiAnimation]}>
					{children}
				</span>
			</ContextMenuTrigger>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	emojiAnimation: state.ui[`emoji-animation-${ownProps.emojiId}`],
	selectedAnimation: state.ui['selected-animation']
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	linkUnfurlingRequestStart: (url) => {
		dispatch(({url}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(EmojiWrapper);

