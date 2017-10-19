/**
 * Created by paulbarrass on 19/10/2017.
 */
import React, {Component} from 'react';
import '!!style!css!./contextMenu.css';

import {ContextMenu, MenuItem, SubMenu} from 'react-contextmenu';

export default class TrackContextMenu extends Component {
	handleClick(e, data) {
		console.log(data);
	}

	render() {
		return (
			<ContextMenu id='track'>
				<MenuItem onClick={this.handleClick}>
					Vote to skip
				</MenuItem>
				<MenuItem divider/>
				<SubMenu title='Save to playlist'>
					<MenuItem onClick={this.handleClick}>
						Starred
					</MenuItem>
					<MenuItem onClick={this.handleClick}>
						DnB forever
					</MenuItem>
				</SubMenu>
				<MenuItem divider/>
				<MenuItem onClick={this.handleClick}>
					View artist
				</MenuItem>
				<MenuItem onClick={this.handleClick}>
					View album
				</MenuItem>

			</ContextMenu>
		);
	}
}
