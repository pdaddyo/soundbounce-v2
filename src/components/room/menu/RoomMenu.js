/**
 * Created by paulbarrass on 03/05/2017.
 */
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import theme from './roomMenu.css';

export default class RoomMenu extends Component {
	static propTypes = {
		room: PropTypes.object.isRequired,
		params: PropTypes.any
	};

	static contextTypes = {
		colors: PropTypes.object
	};

	render() {
		const {room, params} = this.props;
		const roomTab = params.roomTab || 'next-up';
		const {colors} = this.context;
		const {rgba, primary} = colors;

		const MenuItem = ({children, tab}) => {
			const selected = tab === roomTab;
			return (
				<Link to={`/room/${room.id}/${tab}`}>
					<div className={theme[selected ? 'itemSelected' : 'item']} style={{
						borderBottom: selected
							? `solid 0.25rem ${rgba(primary, 0.7)}`
							: '0.25rem transparent'
					}}>
						{children}
					</div>
				</Link>
			);
		};

		return (
			<div className={theme.menu}>
				<MenuItem tab='next-up'>Next Up</MenuItem>
				<MenuItem tab='about'>About</MenuItem>
				<MenuItem tab='listeners'>{room.listeners.length} Listener{
					room.listeners.length === 1 ? '' : 's'
				}</MenuItem>
				<MenuItem tab='top'>Top Rated</MenuItem>
			</div>
		);
	}
}
