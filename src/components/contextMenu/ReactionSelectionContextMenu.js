/**
 * Created by paulbarrass on 19/10/2017.
 */
import React, {Component, PropTypes} from 'react';
import {ContextMenu, MenuItem} from 'react-contextmenu';
import {uiUpdate} from '../../redux/modules/ui';
import {connect} from 'react-redux';

import trackReactionEmojiList from '../room/chat/trackReactionEmojiList';
import {emojify} from 'react-emojione';

class ReactionSelectionContextMenu extends Component {
	static propTypes = {
		setSelectedReactionEmoji: PropTypes.func,
		selectedReaction: PropTypes.string
	};

	render() {
		const {
			setSelectedReactionEmoji,
			selectedReaction = trackReactionEmojiList[0].emoji
		} = this.props;
		return (
			<ContextMenu id='reaction'>
				{trackReactionEmojiList.map(reactionEmojiListItem => (
						<MenuItem onClick={() => {
							setSelectedReactionEmoji(reactionEmojiListItem.emoji);
						}}
								  disabled={reactionEmojiListItem.emoji === selectedReaction}
								  key={reactionEmojiListItem.emoji}>
							{emojify(reactionEmojiListItem.emoji + '      ' + reactionEmojiListItem.name,
								{
									style: {
										width: 20, height: 20, marginLeft: -8, marginRight: 8
									}
								}
							)}
							{reactionEmojiListItem.emoji === selectedReaction && (
								<div style={{position: 'absolute', right: 8, top: 3}}>✓</div>
							)}
						</MenuItem>
					)
				)
				}
			</ContextMenu>
		);
	}
}

const mapStateToProps = state => ({
	selectedReaction: state.ui['selected-reaction']
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	setSelectedReactionEmoji: (animation) => {
		dispatch(uiUpdate({key: 'selected-reaction', newState: animation}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(ReactionSelectionContextMenu);

