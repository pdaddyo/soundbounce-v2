/**
 * Created by paulbarrass on 19/10/2017.
 */
import React, {Component, PropTypes} from 'react';
import {ContextMenu, MenuItem} from 'react-contextmenu';
import {connect} from 'react-redux';

import trackReactionEmojiList from '../room/chat/trackReactionEmojiList';
import {emojify} from 'react-emojione';
import {selectCurrentUser} from '../../redux/modules/users';
import {socketUserPrefsSave} from '../../redux/modules/socket';

class ReactionSelectionContextMenu extends Component {
	static propTypes = {
		setSelectedReactionEmoji: PropTypes.func,
		selectedReaction: PropTypes.string,
		roomId: PropTypes.string
	};

	render() {
		const {
			setSelectedReactionEmoji,
			selectedReaction
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

const mapStateToProps = state => {
	const currentUser = selectCurrentUser(state);
	let emoji = trackReactionEmojiList[0].emoji;
	if (currentUser && currentUser.prefs) {
		emoji = currentUser.prefs['selectedReactionEmoji'];
	}
	return {
		selectedReaction: emoji
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	setSelectedReactionEmoji: (emoji) => {
		dispatch(socketUserPrefsSave({prefs: {selectedReactionEmoji: emoji}}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(ReactionSelectionContextMenu);

