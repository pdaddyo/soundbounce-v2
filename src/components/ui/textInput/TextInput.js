/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {uiUpdate} from 'redux/modules/ui';

class TextInput extends Component {
	static propTypes = {
		uiKey: PropTypes.string.isRequired,
		onEnterPressed: PropTypes.func,
		updateText: PropTypes.func,
		text: PropTypes.string,
		className: PropTypes.string,
		placeholder: PropTypes.string
	};

	onChange = (evt) => {
		this.props.updateText(evt.target.value);
	};

	onKeyDown = (evt) => {
		const {onEnterPressed, text, updateText} = this.props;
		// detect enter press
		if (onEnterPressed && evt.keyCode === 13) {
			onEnterPressed(text);
			updateText('');
		}
	};

	render() {
		const {text, className, placeholder, uiKey} = this.props;
		return (
			<input type='text'
				   name={uiKey}
				   id={uiKey}
				   className={className}
				   value={text || ''}
				   onChange={this.onChange}
				   placeholder={placeholder}
				   maxLength={255}
				   onKeyDown={this.onKeyDown}/>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	text: state.ui[ownProps.uiKey]
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	updateText: (text) => {
		dispatch(uiUpdate({key: ownProps.uiKey, newState: text}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(TextInput);

