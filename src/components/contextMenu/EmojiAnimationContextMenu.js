/**
 * Created by paulbarrass on 19/10/2017.
 */
import React, {Component, PropTypes} from 'react';
import {ContextMenu, MenuItem} from 'react-contextmenu';
import {uiUpdate} from '../../redux/modules/ui';
import {connect} from 'react-redux';

import emojiAnimationList from '../room/chat/emojiAnimationList';

class EmojiAnimationContextMenu extends Component {
	static propTypes = {
		setSelectedAnimation: PropTypes.func,
		selectedAnimation: PropTypes.string
	};

	render() {
		const {
			setSelectedAnimation,
			selectedAnimation = emojiAnimationList[0].cssClass
		} = this.props;
		return (
			<ContextMenu id='emoji-animation'>
				{emojiAnimationList.map(animationDetails => (
					<MenuItem onClick={() => {
						setSelectedAnimation(animationDetails.cssClass);
					}} disabled={animationDetails.cssClass === selectedAnimation}>
						{animationDetails.name}
					</MenuItem>
				))}
			</ContextMenu>
		);
	}
}

const mapStateToProps = state => ({
	selectedAnimation: state.ui['selected-animation']
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	setSelectedAnimation: (animation) => {
		dispatch(uiUpdate({key: 'selected-animation', newState: animation}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(EmojiAnimationContextMenu);

