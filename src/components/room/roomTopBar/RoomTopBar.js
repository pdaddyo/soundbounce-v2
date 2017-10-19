/**
 * Created by paulbarrass on 30/04/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/ui/textInput/TextInput';
import SearchIcon from 'components/svg/icons/Search';
import RoomLeave from 'components/svg/icons/RoomLeave';
import {Link} from 'react-router';
import debounce from 'lodash/debounce';

import theme from './roomTopBar.css';
import {spotifySearchRequest} from '../../../redux/modules/spotify';
import {connect} from 'react-redux';
import {uiUpdate} from '../../../redux/modules/ui';

class RoomTopBar extends Component {
	static propTypes = {
		room: PropTypes.object,
		params: PropTypes.any,
		performSearch: PropTypes.func,
		clearSearch: PropTypes.func
	};

	static contextTypes = {
		colors: PropTypes.object,
		router: PropTypes.object
	};

	debouncedSearch = debounce((query) => this.props.performSearch(query), 250);

	render() {
		const {room, params, clearSearch} = this.props;
		const {colors} = this.context;
		const {rgba, primary} = colors;

		return (
			<div className={theme.topBar}>
				<div className={theme.search}>
					<TextInput className={theme.input}
							   uiKey='inRoomSearch'
							   onFocus={() => {
								   this.context.router.push(`/room/${room.id}/search`);
							   }}
							   onChange={(evt) => {
								   this.debouncedSearch(evt.target.value);
							   }}
							   placeholder='+ Contribute track to room'/>
					{params.roomTab === 'search' ? (
						<div className={theme.closeIcon}
							 onClick={() => {
								 clearSearch();
								 this.context.router.push(`/room/${room.id}`);
							 }}>
							✖
						</div>
					) : (
						<div className={theme.searchIcon}>
							<SearchIcon/>
						</div>
					)}
				</div>
				<div className={theme.topBarRight} style={{color: rgba(primary, 0.9)}}>
					<div className={theme.roomName}>
						{room.name}
					</div>
					<Link to='/home'>
						<div className={theme.roomLeave}>
							<RoomLeave color={rgba(primary, 0.9)} size={3}/>
						</div>
					</Link>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({
	performSearch: (query) => {
		dispatch(spotifySearchRequest(query));
	},
	clearSearch: () => {
		dispatch(uiUpdate({key: 'inRoomSearch', newState: ''}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(RoomTopBar);

