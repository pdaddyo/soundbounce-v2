/**
 * Created by paulbarrass on 30/04/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/ui/textInput/TextInput';
import SearchIcon from 'components/svg/icons/Search';

import theme from './homeTopBar.css';

export default class HomeTopBar extends Component {
	static propTypes = {
		room: PropTypes.object
	};

	render() {
		return (
			<div className={theme.topBar}>
				<div className={theme.search}>
					<TextInput className={theme.input}
							   uiKey='inRoomSearch'
							   placeholder='Search for rooms'/>
					<div className={theme.searchIcon}>
						<SearchIcon/>
					</div>
				</div>
			</div>
		);
	}
}
