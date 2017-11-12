/**
 * Created by paulbarrass on 07/11/2017.
 */
import React, {Component} from 'react';
import loading from './loading.svg';

export default class Loading extends Component {
	static propTypes = {};

	render() {
		return (
			<img src={loading} {...this.props}/>
		);
	}
}
