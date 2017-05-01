/**
 * Created by paulbarrass on 30/04/2017.
 */
import React, {Component, PropTypes} from 'react';
import TextInput from 'components/ui/textInput/TextInput';
import SearchIcon from 'components/svg/icons/Search';
import RoomLeave from 'components/svg/icons/RoomLeave';
import {Link} from 'react-router';

import theme from './roomTopBar.css';

export default class RoomTopBar extends Component {
	static propTypes = {
		room: PropTypes.object
	};

	render() {
		const {room} = this.props;
		const {primary} = room.config.colors;

		return (
			<div className={theme.topBar}>
				<div className={theme.search}>
					<TextInput className={theme.input}
							   uiKey='inRoomSearch'
							   placeholder='Contribute track to room'/>
					<div className={theme.searchIcon}>
						<SearchIcon/>
					</div>
				</div>
				<div className={theme.topBarRight} style={{color: primary}}>
					<div className={theme.roomName}>
						{room.name}
					</div>
					<Link to='/home'>
						<div className={theme.roomLeave}>
							<RoomLeave color={primary} size={3}/>
						</div>
					</Link>
				</div>
			</div>
		);
	}
}
