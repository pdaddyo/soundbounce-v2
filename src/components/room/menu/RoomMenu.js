/**
 * Created by paulbarrass on 03/05/2017.
 */
import React, {Component, PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {Link} from 'react-router';
import theme from './roomMenu.css';

export default class RoomMenu extends Component {
	static propTypes = {
		roomId: PropTypes.object.isRequired,
		listeners: PropTypes.array,
		params: PropTypes.any
	};

	static contextTypes = {
		colors: PropTypes.object
	};

	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		const {roomId, listeners, params} = this.props;
		const roomTab = params.roomTab || 'next-up';
		const {colors} = this.context;
		const {rgba, primary} = colors;

		const MenuItem = ({children, tab}) => {
			const selected = tab === roomTab;
			const url = `/room/${roomId}/${tab}`;
			return (
				<Link to={url} key={url}>
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
				<MenuItem tab='listeners'>{listeners.length} Listener{
					listeners.length === 1 ? '' : 's'
				}</MenuItem>
				<MenuItem tab='top'>Top Rated</MenuItem>
			</div>
		);
	}
}
