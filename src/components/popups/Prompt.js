/**
 * Created by paulbarrass on 21/10/2017.
 */
import React, {Component, PropTypes} from 'react';
import Popup from 'react-popup';

class Prompt extends Component {
	static propTypes = {
		onChange: PropTypes.func,
		placeholder: PropTypes.string,
		defaultValue: PropTypes.string,
		callback: PropTypes.func
	};

	constructor(props) {
		super(props);

		this.state = {
			value: this.props.defaultValue
		};

		this.onChange = (e) => this._onChange(e);
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.value !== this.state.value) {
			this.props.onChange(this.state.value);
		}
	}

	componentDidMount() {
		this.refs.text.focus();
	}

	_onChange(e) {
		let value = e.target.value;
		this.setState({value: value});
	}

	render() {
		return (
			<input type='text'
				   ref='text'
				   placeholder={this.props.placeholder} className="mm-popup__input"
				   value={this.state.value}
				   onChange={this.onChange}
				   onKeyDown={(evt) => {
					   // detect enter press
					   if (evt.keyCode === 13) {
						   this.props.callback(this.state.value);
						   Popup.close();
					   }
				   }}
			/>);
	}
}

Popup.registerPlugin('prompt', function ({
											 defaultValue = '',
											 placeholder,
											 callback,
											 title,
											 okButtonText = 'OK'
										 }) {
	let promptValue = null;
	const promptChange = function (value) {
		promptValue = value;
	};

	this.create({
		title,
		content: <Prompt onChange={promptChange}
						 placeholder={placeholder}
						 defaultValue={defaultValue}
						 callback={callback}
		/>,
		buttons: {
			left: ['cancel'],
			right: [{
				text: okButtonText,
				className: 'success',
				action: function () {
					callback(promptValue);
					Popup.close();
				}
			}]
		}
	});
});
