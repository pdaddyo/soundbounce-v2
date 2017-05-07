/**
 * Created by paulbarrass on 30/04/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

/*
 Wraps ReactCSSTransitionGroup with some sane defaults
 */
export default class Transition extends Component {

	static propTypes = {
		children: PropTypes.any.isRequired,
		duration: PropTypes.number,
		style: PropTypes.object.isRequired
	};

	static defaultProps = {
		duration: 800
	};

	render() {
		const {children, duration, style} = this.props;
		return (
			<ReactCSSTransitionGroup transitionName={style}
									 transitionAppear={true}
									 transitionAppearTimeout={duration}
									 transitionEnterTimeout={duration}
									 transitionLeaveTimeout={duration}>
				{children}
			</ReactCSSTransitionGroup>
		);
	}
}
